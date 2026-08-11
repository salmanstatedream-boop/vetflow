import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Card,
  Muted,
  SecondaryButton,
  Title,
} from '@/components/ui';
import { Brand, Colors, Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const clinic = profile?.clinics[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SecondaryButton label="← Back" onPress={() => router.back()} />
        <View style={{ height: Spacing.md }} />
        <Title>My profile</Title>
        <Muted>Contact details from your linked clinic records.</Muted>
        <View style={{ height: Spacing.lg }} />
        <Card>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>
            {clinic
              ? `${clinic.firstName} ${clinic.lastName}`.trim()
              : 'Not linked yet'}
          </Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{clinic?.email || user?.email || '—'}</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{clinic?.phone || '—'}</Text>
          <View style={{ height: 8 }} />
          <Badge label={`${Brand.appName} account`} />
        </Card>
        <View style={{ height: Spacing.md }} />
        <Card>
          <Text style={styles.label}>Linked clinics</Text>
          {(profile?.clinics || []).length === 0 ? (
            <Muted>No clinics linked yet.</Muted>
          ) : (
            profile?.clinics.map((c) => (
              <View key={c.linkId} style={{ marginTop: 8 }}>
                <Badge label={c.clinicName} tone="success" />
                <Muted>
                  {c.firstName} {c.lastName}
                </Muted>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  label: {
    marginTop: 12,
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
});
