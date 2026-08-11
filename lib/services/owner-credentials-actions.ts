'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';
import { writeAuditLog } from '@/lib/services/audit';
import { PRODUCT_NAME, NOREPLY_FROM } from '@/lib/brand';

const IssueSchema = z.object({
  customerId: z.string().uuid(),
  loginEmail: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

const EmailSchema = z.object({
  customerId: z.string().uuid(),
  loginEmail: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

function buildLoginDeepLink(email: string, password: string) {
  const params = new URLSearchParams({ email, password });
  return `phoenixcare://login?${params.toString()}`;
}

async function findAuthUserIdByEmail(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  email: string,
  customerId: string
): Promise<string | null> {
  const { data: cred } = await admin
    .from('owner_mobile_credentials')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle();
  if (cred?.user_id) return cred.user_id as string;

  const { data: link } = await admin
    .from('customer_account_links')
    .select('user_id')
    .eq('customer_id', customerId)
    .maybeSingle();
  if (link?.user_id) return link.user_id as string;

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export async function issueOwnerCredentialsAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx?.organizationId) throw new Error('Unauthorized');
    if (!hasCapability(ctx.role, 'manage_customers')) {
      throw new Error('Forbidden');
    }

    const parsed = IssueSchema.parse(payload);
    const loginEmail = parsed.loginEmail.trim().toLowerCase();
    const password = parsed.password;

    const supabase = await createClient();

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, organization_id, branch_id')
      .eq('id', parsed.customerId)
      .eq('organization_id', ctx.organizationId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!customer) throw new Error('Customer not found');

    const admin = await createAdminClient();

    let userId = await findAuthUserIdByEmail(admin, loginEmail, customer.id);
    let created = false;

    if (userId) {
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        email: loginEmail,
        password,
        email_confirm: true,
      });
      if (updateError) throw new Error(updateError.message);
    } else {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: loginEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          owner_app: true,
        },
      });
      if (authError || !authData.user) {
        const msg = authError?.message || 'Failed to create owner auth user';
        if (/already|registered|exists/i.test(msg)) {
          userId = await findAuthUserIdByEmail(admin, loginEmail, customer.id);
          if (!userId) throw new Error(msg);
          const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
            email: loginEmail,
            password,
            email_confirm: true,
          });
          if (updateError) throw new Error(updateError.message);
        } else {
          throw new Error(msg);
        }
      } else {
        userId = authData.user.id;
        created = true;
      }
    }

    if (!userId) throw new Error('Could not resolve owner auth user');

    const { error: linkError } = await admin.from('customer_account_links').upsert(
      {
        user_id: userId,
        customer_id: customer.id,
        organization_id: ctx.organizationId,
      },
      { onConflict: 'user_id,customer_id' }
    );
    if (linkError) throw new Error(linkError.message);

    const emailsToMatch = new Set<string>([loginEmail]);
    if (customer.email?.trim()) {
      emailsToMatch.add(customer.email.trim().toLowerCase());
    }
    for (const matchEmail of emailsToMatch) {
      const { data: matches } = await admin
        .from('customers')
        .select('id, organization_id')
        .ilike('email', matchEmail)
        .is('deleted_at', null);
      for (const c of matches || []) {
        await admin.from('customer_account_links').upsert(
          {
            user_id: userId,
            customer_id: c.id,
            organization_id: c.organization_id,
          },
          { onConflict: 'user_id,customer_id' }
        );
      }
    }

    const now = new Date().toISOString();
    const { error: credError } = await admin.from('owner_mobile_credentials').upsert(
      {
        organization_id: ctx.organizationId,
        customer_id: customer.id,
        user_id: userId,
        issued_by: ctx.userId,
        last_issued_at: now,
      },
      { onConflict: 'customer_id' }
    );
    if (credError) throw new Error(credError.message);

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: customer.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: created ? 'OWNER_CREDENTIALS_CREATED' : 'OWNER_CREDENTIALS_ROTATED',
      resourceType: 'CUSTOMER',
      resourceId: customer.id,
      category: 'access',
      afterData: { email: loginEmail, userId },
    });

    const deepLink = buildLoginDeepLink(loginEmail, password);

    return {
      success: true as const,
      email: loginEmail,
      password,
      deepLink,
      deliveryEmail: customer.email?.trim() || null,
      created,
      message: created
        ? 'Phoenix Care login credentials created'
        : 'Phoenix Care login credentials updated',
    };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to issue credentials',
    };
  }
}

export async function emailOwnerCredentialsAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx?.organizationId) throw new Error('Unauthorized');
    if (!hasCapability(ctx.role, 'manage_customers')) {
      throw new Error('Forbidden');
    }

    const parsed = EmailSchema.parse(payload);
    const loginEmail = parsed.loginEmail.trim().toLowerCase();
    const password = parsed.password;
    const deepLink = buildLoginDeepLink(loginEmail, password);

    const supabase = await createClient();
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, organization_id')
      .eq('id', parsed.customerId)
      .eq('organization_id', ctx.organizationId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!customer) throw new Error('Customer not found');

    const to = customer.email?.trim();
    if (!to || !to.includes('@')) {
      throw new Error('Customer needs a profile email address to receive credentials');
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      throw new Error('Email is not configured (RESEND_API_KEY missing)');
    }

    const qrPng = await QRCode.toBuffer(deepLink, {
      type: 'png',
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    const qrBase64 = qrPng.toString('base64');

    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: NOREPLY_FROM,
      to,
      subject: `Your Phoenix Care login · ${PRODUCT_NAME}`,
      html: `
        <p>Hi ${customer.first_name},</p>
        <p>Your clinic created a <strong>Phoenix Care</strong> login so you can open the app without a one-time code.</p>
        <p><strong>Login ID:</strong> ${loginEmail}<br/>
        <strong>Password:</strong> ${password}</p>
        <p>Scan this QR code in Phoenix Care (Welcome → Scan login QR), or sign in with Password using the details above.</p>
        <p><img src="data:image/png;base64,${qrBase64}" alt="Phoenix Care login QR" width="200" height="200" style="border:1px solid #e2e8f0;border-radius:12px" /></p>
        <p style="font-size:12px;color:#64748b">Deep link: <a href="${deepLink}">${deepLink}</a></p>
      `,
      attachments: [
        {
          filename: 'phoenix-care-login-qr.png',
          content: qrPng,
        },
      ],
    });

    if (sendError) throw new Error(sendError.message);

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: null,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'OWNER_CREDENTIALS_EMAILED',
      resourceType: 'CUSTOMER',
      resourceId: customer.id,
      category: 'access',
      afterData: { to, loginEmail },
    });

    return {
      success: true as const,
      message: `Credentials emailed to ${to}`,
    };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to email credentials',
    };
  }
}
