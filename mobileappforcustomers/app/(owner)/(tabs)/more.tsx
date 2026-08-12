import { type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Badge, Card, Muted, SecondaryButton, Title } from '@/components/ui';
import { Brand, Colors, Fonts, Layout, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { go } from '@/lib/nav';

function Row({
  icon,
  title,
  subtitle,
  onPress,
  badge,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <FontAwesome name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Muted>{subtitle}</Muted>
      </View>
      {badge ? <Badge label={badge} /> : null}
      <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const { profile, signOut, user } = useAuth();
  const router = useRouter();
  const clinic = profile?.clinics[0];
  const name = clinic
    ? `${clinic.firstName} ${clinic.lastName}`.trim()
    : user?.email || 'Owner';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>More</Title>
        <Card style={{ marginTop: Spacing.md }}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(clinic?.firstName?.[0] || 'P').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              <Muted>{user?.email}</Muted>
              <View style={{ height: 6 }} />
              <Badge label={`${Brand.appName} member`} />
            </View>
          </View>
        </Card>

        <Text style={styles.section}>Connected clinics</Text>
        {(profile?.clinics || []).length === 0 ? (
          <Card>
            <Muted>No clinic linked yet.</Muted>
          </Card>
        ) : (
          profile?.clinics.map((c) => (
            <Card key={c.linkId} style={{ marginBottom: 8 }}>
              <View style={styles.clinicRow}>
                <Text style={styles.clinicName}>{c.clinicName}</Text>
                <Badge label="Active" tone="success" />
              </View>
              <Muted>
                {c.firstName} {c.lastName} · {c.phone || c.email || ''}
              </Muted>
            </Card>
          ))
        )}

        <Text style={styles.section}>Account</Text>
        <Card style={{ paddingVertical: 4 }}>
          <Row
            icon="bell"
            title="Notifications"
            subtitle="Reminders & updates"
            onPress={() => go('/(owner)/notifications')}
          />
          <Row
            icon="user"
            title="My profile"
            subtitle="Contact details"
            onPress={() => router.push('/(owner)/(tabs)/profile')}
          />
          {profile?.isStaff ? (
            <Row
              icon="laptop"
              title="Clinic dashboard"
              subtitle="Open Phoenix OS"
              onPress={() => router.push('/(staff)/dashboard')}
            />
          ) : null}
          <Row
            icon="qrcode"
            title="Connect another clinic"
            subtitle="Scan invite QR or enter code"
            onPress={() => router.push('/(auth)/connect')}
          />
        </Card>

        <View style={{ height: Spacing.xl }} />
        <SecondaryButton
          label="Sign out"
          danger
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.xl,
    paddingBottom: Layout.tabBarHeight + Layout.floatingTabBottom + 24,
  },
  profileRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 18 },
  name: { fontSize: 17, fontFamily: Fonts.bold, color: Colors.text },
  section: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: Fonts.semiBold, color: Colors.text },
  clinicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clinicName: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
});
