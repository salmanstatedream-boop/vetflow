import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PdfClinicHeader from '@/components/pdf/PdfClinicHeader';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#17403a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  body: { fontSize: 10, lineHeight: 1.4, color: '#4A5568' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 110, fontSize: 9, color: '#718096' },
  value: { flex: 1, fontSize: 10 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#EDF2F7' },
  colDate: { width: '22%' },
  colMetric: { width: '18%' },
  colValue: { width: '20%' },
  colNote: { width: '40%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});

export type PetMedicalFilePdfProps = {
  clinicName: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  logoUrl?: string | null;
  brandName?: string;
  accentColor?: string;
  petName: string;
  species: string;
  breed: string;
  gender: string;
  patientNumber: string;
  ownerName: string;
  ownerPhone: string;
  allergies: string;
  medicalNotes: string;
  metricRows: Array<{ date: string; weightKg: string; temp: string; diagnosis: string }>;
  workflowRows: Array<{ date: string; type: string; summary: string }>;
  visitSummaries: Array<{ date: string; reason: string; doctor: string; diagnosis: string }>;
  invoiceRows: Array<{ date: string; number: string; total: string; status: string }>;
  documentCount: number;
  generatedAt: string;
};

export default function PetMedicalFilePdfDocument(props: PetMedicalFilePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfClinicHeader
          clinicName={props.clinicName}
          branchName={props.branchName}
          branchAddress={props.branchAddress}
          branchPhone={props.branchPhone}
          logoUrl={props.logoUrl}
          brandName={props.brandName}
          accentColor={props.accentColor}
        />

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#17403a', marginBottom: 8 }}>
            Patient Medical File
          </Text>
          <Text style={styles.body}>
            {props.petName} · {props.species}
            {props.breed ? ` · ${props.breed}` : ''} · {props.gender}
          </Text>
          <Text style={styles.body}>Patient #{props.patientNumber || '—'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <Text style={styles.body}>
            {props.ownerName} · {props.ownerPhone}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care notes</Text>
          <Text style={styles.body}>Allergies: {props.allergies || 'None recorded'}</Text>
          <Text style={[styles.body, { marginTop: 4 }]}>
            Medical notes: {props.medicalNotes || 'None recorded'}
          </Text>
        </View>

        {props.metricRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health metrics</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colMetric}>Weight</Text>
              <Text style={styles.colValue}>Temp</Text>
              <Text style={styles.colNote}>Diagnosis</Text>
            </View>
            {props.metricRows.slice(0, 12).map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDate}>{row.date}</Text>
                <Text style={styles.colMetric}>{row.weightKg}</Text>
                <Text style={styles.colValue}>{row.temp}</Text>
                <Text style={styles.colNote}>{row.diagnosis}</Text>
              </View>
            ))}
          </View>
        )}

        {props.workflowRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflow history</Text>
            {props.workflowRows.slice(0, 8).map((row, i) => (
              <Text key={i} style={styles.body}>
                {row.date} · {row.type}: {row.summary}
              </Text>
            ))}
          </View>
        )}

        {props.visitSummaries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit history</Text>
            {props.visitSummaries.slice(0, 10).map((v, i) => (
              <Text key={i} style={[styles.body, { marginBottom: 4 }]}>
                {v.date} — {v.reason} ({v.doctor}). Dx: {v.diagnosis || '—'}
              </Text>
            ))}
          </View>
        )}

        {props.invoiceRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing summary</Text>
            {props.invoiceRows.slice(0, 8).map((inv, i) => (
              <Text key={i} style={styles.body}>
                {inv.date} · {inv.number} · {inv.total} ({inv.status})
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.body}>Attached documents on file: {props.documentCount}</Text>

        <Text style={styles.footer}>Generated {props.generatedAt}</Text>
      </Page>
    </Document>
  );
}
