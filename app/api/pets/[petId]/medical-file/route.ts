import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import PetMedicalFilePdfDocument from '@/components/pdf/PetMedicalFilePdfDocument';
import { createClient } from '@/lib/supabase/server';
import { assertOrganization, resolveServerAuthContext } from '@/lib/auth/context';
import { getPdfBranding } from '@/lib/services/branding';
import { getPatientMedicalProfileAction } from '@/lib/services/patient-medical-actions';
import { buildHealthTimeline } from '@/lib/patients/health-timeline';
import { PRODUCT_NAME } from '@/lib/brand';
import { formatTemperatureFFromC } from '@/lib/utils/temperature';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ petId: string }> }
) {
  try {
    const { petId } = await params;
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      return new Response('Unauthorized', { status: 401 });
    }
    assertOrganization(ctx);

    const profileRes = await getPatientMedicalProfileAction(petId);
    if (!profileRes.success) {
      return new Response(profileRes.error || 'Not found', { status: 404 });
    }

    const profile = profileRes.data;
    const supabase = await createClient();
    const { data: branch } = await supabase
      .from('branches')
      .select('name, address, phone')
      .eq('id', ctx.branches[0]?.id)
      .maybeSingle();

    const branding = await getPdfBranding(
      supabase,
      ctx.organizationId!,
      ctx.organizationName || PRODUCT_NAME
    );
    const { metricPoints } = buildHealthTimeline(profile);

    const metricRows = metricPoints.slice(0, 20).map((p) => {
      const visit = profile.visits.find((v) => v.id === p.visitId);
      return {
        date: new Date(p.date).toLocaleDateString(),
        weightKg: p.weightKg != null ? `${p.weightKg} kg` : '—',
        temp: p.temperatureC != null ? formatTemperatureFFromC(p.temperatureC) : '—',
        diagnosis: visit?.notes?.diagnosis || '—',
      };
    });

    const workflowRows = profile.workflowRecords.map((chart) => {
      let summary: string = chart.visitPurpose;
      if (chart.workflowType === 'vaccination') {
        summary = chart.vaccineName || summary;
      } else if (chart.workflowType === 'deworming') {
        summary = chart.dewormerName || summary;
      } else if (chart.workflowType === 'grooming') {
        summary = chart.servicesPerformed || summary;
      }
      return {
        date: new Date(chart.date).toLocaleDateString(),
        type: chart.workflowType,
        summary,
      };
    });

    const visitSummaries = profile.visits.map((v) => ({
      date: new Date(v.checked_in_at || '').toLocaleDateString(),
      reason: v.reason || 'Visit',
      doctor: v.doctorName || '—',
      diagnosis: v.notes?.diagnosis || '—',
    }));

    const invoiceRows = (profile.invoices || []).map((inv) => ({
      date: new Date(inv.created_at).toLocaleDateString(),
      number: inv.invoice_number,
      total: String(inv.total),
      status: inv.payment_status,
    }));

    const stream = await renderToStream(
      React.createElement(PetMedicalFilePdfDocument, {
        clinicName: branding.clinicName,
        branchName: branch?.name || branding.clinicName,
        branchAddress: branch?.address || '',
        branchPhone: branding.phone || branch?.phone || '',
        logoUrl: branding.logoUrl,
        brandName: branding.brandName,
        accentColor: branding.accentColor,
        petName: profile.petName,
        species: profile.species,
        breed: profile.breed || '',
        gender: profile.gender || '',
        patientNumber: profile.patientNumber || '',
        ownerName: profile.owner?.name || '—',
        ownerPhone: profile.owner?.phone || '—',
        allergies: profile.allergies || '',
        medicalNotes: profile.medicalNotes || '',
        metricRows,
        workflowRows,
        visitSummaries,
        invoiceRows,
        documentCount: profile.allDocuments?.length ?? 0,
        generatedAt: new Date().toLocaleString(),
      }) as any
    );

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="medical-file-${profile.petName.replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Pet medical file PDF error:', err);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}
