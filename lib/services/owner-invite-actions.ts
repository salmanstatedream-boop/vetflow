'use server';

import { z } from 'zod';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';
import { PRODUCT_NAME, APP_URL, NOREPLY_FROM } from '@/lib/brand';

const InviteSchema = z.object({
  customerId: z.string().uuid(),
});

export async function inviteOwnerToPhoenixCareAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx?.organizationId) throw new Error('Unauthorized');
    if (!hasCapability(ctx.role, 'manage_customers')) {
      throw new Error('Forbidden');
    }

    const parsed = InviteSchema.parse(payload);
    const supabase = await createClient();

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, organization_id')
      .eq('id', parsed.customerId)
      .eq('organization_id', ctx.organizationId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!customer) throw new Error('Customer not found');
    if (!customer.email?.trim()) {
      throw new Error('Customer needs an email address to receive a Phoenix Care invite');
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const admin = await createAdminClient();
    const { error: inviteError } = await admin.from('owner_invites').insert({
      organization_id: ctx.organizationId,
      customer_id: customer.id,
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone,
      token,
      invited_by: ctx.userId,
      expires_at: expiresAt,
    });

    if (inviteError) throw new Error(inviteError.message);

    const deepLink = `phoenixcare://invite/${token}`;
    const webHint = `${APP_URL.replace(/\/$/, '')}/book`;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: NOREPLY_FROM,
        to: customer.email.trim(),
        subject: `You're invited to Phoenix Care · ${PRODUCT_NAME}`,
        html: `
          <p>Hi ${customer.first_name},</p>
          <p>Your clinic invited you to <strong>Phoenix Care</strong> — book appointments and view your pets' records on your phone.</p>
          <p>Open the Phoenix Care app and sign in with <strong>${customer.email}</strong>, then enter invite code:</p>
          <p style="font-size:18px;font-weight:700;letter-spacing:0.04em">${token}</p>
          <p>Or use this deep link on a device with the app: <a href="${deepLink}">${deepLink}</a></p>
          <p style="color:#64748b;font-size:12px">This invite expires in 14 days. Clinic booking page: ${webHint}</p>
        `,
      });
    }

    return {
      success: true,
      token,
      emailed: Boolean(resendKey),
      message: resendKey
        ? 'Invite sent by email'
        : 'Invite created (email not configured — share the token manually)',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to invite',
    };
  }
}
