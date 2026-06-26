import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import VaccinationCertificatePdfDocument from '@/components/pdf/VaccinationCertificatePdfDocument';
import { createClient } from '@/lib/supabase/server';
import { assertCapability, resolveServerAuthContext } from '@/lib/auth/context';
import { getPdfBranding } from '@/lib/services/branding';
import { formatAttendingDoctor } from '@/lib/utils/doctor-display';
import { parseWorkflowPayload } from '@/lib/consultations/workflow-validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ visitId: string }> }
) {
  try {
    const { visitId } = await params;

    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      return new Response('Unauthorized', { status: 401 });
    }
    try {
      assertCapability(ctx, 'view_treatment_pdf');
    } catch {
      try {
        assertCapability(ctx, 'clinical_queue');
      } catch {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const supabase = await createClient();

    const { data: visit, error } = await supabase
      .from('visits')
      .select(`
        id,
        workflow_payload,
        visit_purpose,
        completed_at,
        checked_in_at,
        doctor_id,
        patients ( name, species ),
        customers ( first_name, last_name ),
        branches ( name, address, phone ),
        doctor:user_profiles!visits_doctor_id_fkey ( first_name, last_name )
      `)
      .eq('id', visitId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (error || !visit) {
      return new Response('Visit not found', { status: 404 });
    }

    const payload = parseWorkflowPayload(visit.workflow_payload);
    if (!payload || payload.workflowType !== 'vaccination') {
      return new Response('No vaccination workflow record for this visit', { status: 404 });
    }

    const vaccine = payload.sections.process.vaccines?.[0];
    if (!vaccine?.name) {
      return new Response('Vaccine details not recorded', { status: 404 });
    }

    let doctorProfile = visit.doctor as { first_name?: string; last_name?: string } | null;
    if (!doctorProfile?.first_name && !doctorProfile?.last_name) {
      const { data: assignment } = await supabase
        .from('visit_assignments')
        .select('doctor:user_profiles!visit_assignments_doctor_id_fkey ( first_name, last_name )')
        .eq('visit_id', visitId)
        .maybeSingle();
      doctorProfile = (assignment?.doctor as typeof doctorProfile) ?? null;
    }

    const branch = visit.branches as { name: string; address: string | null; phone: string | null };
    const patient = visit.patients as { name: string; species: string };
    const customer = visit.customers as { first_name: string; last_name: string };
    const clinicName = ctx.organizationName || branch?.name || 'Clinic';

    const branding = await getPdfBranding(supabase, ctx.organizationId!, clinicName);

    const administeredAt =
      vaccine.administeredAt ||
      visit.completed_at ||
      visit.checked_in_at ||
      new Date().toISOString();

    const stream = await renderToStream(
      React.createElement(VaccinationCertificatePdfDocument, {
        clinicName: branding.brandName,
        brandName: branding.brandName,
        logoUrl: branding.logoUrl,
        branchName: branch?.name ?? '',
        branchAddress: branch?.address ?? branding.address ?? '',
        branchPhone: branch?.phone ?? branding.phone ?? '',
        petName: patient.name,
        petSpecies: patient.species,
        ownerName: `${customer.first_name} ${customer.last_name}`.trim(),
        vaccineName: vaccine.name,
        vaccineType: vaccine.type,
        manufacturer: vaccine.manufacturer,
        lotNumber: vaccine.lotNumber,
        expiryDate: vaccine.expiryDate,
        dose: vaccine.dose,
        routeSite: [vaccine.route, vaccine.site].filter(Boolean).join(' / '),
        administeredAt: new Date(administeredAt).toLocaleDateString(),
        administeredBy: vaccine.administeredByName || '—',
        nextDueDate: vaccine.nextDueDate,
        doctorName: formatAttendingDoctor(doctorProfile),
      }) as Parameters<typeof renderToStream>[0]
    );

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="vaccination-certificate-${visitId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Vaccination certificate PDF error:', err);
    return new Response('Failed to generate certificate', { status: 500 });
  }
}
