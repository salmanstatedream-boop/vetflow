import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
    objectFit: 'contain' as const,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  detailLine: {
    fontSize: 8,
    color: '#718096',
    lineHeight: 1.4,
  },
});

export interface PdfClinicHeaderProps {
  clinicName: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  brandName?: string;
  accentColor?: string;
  logoUrl?: string | null;
}

export default function PdfClinicHeader({
  clinicName,
  branchName,
  branchAddress,
  branchPhone,
  brandName,
  accentColor = '#0F172A',
  logoUrl,
}: PdfClinicHeaderProps) {
  const displayName = brandName || clinicName;

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        {logoUrl ? (
          <Image src={logoUrl} style={styles.logoImage} />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: accentColor }]} />
        )}
        <Text style={[styles.clinicName, { color: accentColor }]}>{displayName}</Text>
      </View>
      <Text style={styles.detailLine}>{branchName}</Text>
      {branchAddress ? <Text style={styles.detailLine}>{branchAddress}</Text> : null}
      {branchPhone ? <Text style={styles.detailLine}>Phone: {branchPhone}</Text> : null}
    </View>
  );
}
