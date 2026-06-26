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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#17403a',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: { marginBottom: 12 },
  label: { fontSize: 8, color: '#718096', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
  body: { fontSize: 10, lineHeight: 1.5, color: '#4A5568' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  col: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#A0AEC0',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

export type VaccinationCertificatePdfProps = {
  clinicName: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  brandName?: string;
  logoUrl?: string | null;
  petName: string;
  petSpecies: string;
  ownerName: string;
  vaccineName: string;
  vaccineType?: string;
  manufacturer?: string;
  lotNumber?: string;
  expiryDate?: string;
  dose?: string;
  routeSite?: string;
  administeredAt: string;
  administeredBy: string;
  nextDueDate?: string;
  doctorName: string;
};

export default function VaccinationCertificatePdfDocument(props: VaccinationCertificatePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfClinicHeader
          clinicName={props.clinicName}
          branchName={props.branchName}
          branchAddress={props.branchAddress}
          branchPhone={props.branchPhone}
          brandName={props.brandName}
          logoUrl={props.logoUrl}
        />
        <Text style={styles.title}>Vaccination Certificate</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Patient</Text>
          <Text style={styles.value}>
            {props.petName} ({props.petSpecies})
          </Text>
          <Text style={styles.body}>Owner: {props.ownerName}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Vaccine</Text>
            <Text style={styles.value}>{props.vaccineName}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{props.vaccineType || '—'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Manufacturer</Text>
            <Text style={styles.value}>{props.manufacturer || '—'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Lot number</Text>
            <Text style={styles.value}>{props.lotNumber || '—'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.value}>{props.expiryDate || '—'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Dose</Text>
            <Text style={styles.value}>{props.dose || '—'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Route / site</Text>
            <Text style={styles.value}>{props.routeSite || '—'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Date administered</Text>
            <Text style={styles.value}>{props.administeredAt}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Administered by</Text>
            <Text style={styles.value}>{props.administeredBy}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Next due</Text>
            <Text style={styles.value}>{props.nextDueDate || '—'}</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={styles.label}>Attending veterinarian</Text>
          <Text style={styles.value}>{props.doctorName}</Text>
        </View>

        <Text style={styles.footer}>
          This certificate was generated electronically by {props.clinicName}.
        </Text>
      </Page>
    </Document>
  );
}
