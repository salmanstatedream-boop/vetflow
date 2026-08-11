import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Card,
  EmptyState,
  ErrorBanner,
  GradientPetHero,
  Muted,
  QuickActionTile,
  Skeleton,
  Subtitle,
} from '@/components/ui';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { ownerApi, type OwnerAppointment, type OwnerPet } from '@/lib/api';
import { go } from '@/lib/nav';

function petAge(dob?: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const months = Math.max(
    0,
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  const y = Math.floor(months / 12);
  const m = Math.floor(months % 12);
  return `${y} yrs ${m}mo`;
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<OwnerPet[]>([]);
  const [appts, setAppts] = useState<OwnerAppointment[]>([]);
  const [petId, setPetId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, a, n] = await Promise.all([
        ownerApi.pets(),
        ownerApi.appointments(),
        ownerApi.notifications().catch(() => ({ unreadCount: 0 })),
      ]);
      setPets(p.pets);
      setAppts(a.appointments);
      setUnread(n.unreadCount || 0);
      setPetId((cur) => cur || p.pets[0]?.id || null);
      setClinicId((cur) => cur || profile?.clinics[0]?.organizationId || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load home');
      setPets([]);
      setAppts([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.clinics]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const clinics = profile?.clinics || [];
  const activeClinic =
    clinics.find((c) => c.organizationId === clinicId) || clinics[0] || null;

  const clinicPets = useMemo(() => {
    if (!activeClinic) return pets;
    return pets.filter((p) => p.organizationId === activeClinic.organizationId);
  }, [pets, activeClinic]);

  const selected = useMemo(
    () => clinicPets.find((p) => p.id === petId) || clinicPets[0] || pets[0] || null,
    [clinicPets, pets, petId]
  );

  const nextCare = useMemo(() => {
    if (!selected) return null;
    const upcoming = appts
      .filter(
        (a) =>
          a.patientId === selected.id &&
          !['cancelled', 'completed', 'no_show'].includes(a.status)
      )
      .sort((a, b) =>
        `${a.preferredDate}${a.preferredTime}`.localeCompare(
          `${b.preferredDate}${b.preferredTime}`
        )
      )[0];
    if (!upcoming) return null;
    return `${upcoming.reason} · ${upcoming.preferredDate} · ${String(upcoming.preferredTime).slice(0, 5)}`;
  }, [appts, selected]);

  const initials =
    `${activeClinic?.firstName?.[0] || ''}${activeClinic?.lastName?.[0] || ''}`.toUpperCase() ||
    'PC';

  const meta = [
    petAge(selected?.dateOfBirth),
    selected?.weightKg != null ? `${selected.weightKg} kg` : null,
    selected?.gender,
  ]
    .filter(Boolean)
    .join(' · ');

  const callClinic = () => {
    const phone = activeClinic?.clinicPhone;
    if (!phone) {
      Alert.alert(
        'No clinic phone on file',
        activeClinic?.afterHoursNote ||
          'Ask your clinic to add a phone number in Phoenix OS settings.'
      );
      return;
    }
    Alert.alert('Emergency', `Call ${activeClinic?.clinicName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        style: 'destructive',
        onPress: () => void Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`),
      },
      {
        text: 'After-hours info',
        onPress: () =>
          Alert.alert(
            'After hours',
            activeClinic?.afterHoursNote || 'Contact the nearest emergency hospital.'
          ),
      },
    ]);
  };

  const openChat = async () => {
    if (!activeClinic) {
      Alert.alert('Connect a clinic first');
      return;
    }
    try {
      const res = await ownerApi.openThread(
        activeClinic.organizationId,
        activeClinic.customerId
      );
      go(`/(owner)/chat/${res.threadId}`);
    } catch (err: unknown) {
      Alert.alert('Chat unavailable', err instanceof Error ? err.message : 'Try again');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={styles.header}>
          <Card style={{ flex: 1, paddingVertical: 14 }}>
            <Text style={styles.clinicLabel}>Your clinic</Text>
            <Text style={styles.clinicName}>
              {activeClinic?.clinicName || 'Connect a clinic'}
            </Text>
            <Muted>
              {activeClinic
                ? `${activeClinic.firstName} ${activeClinic.lastName}`.trim()
                : 'Invite code required'}
            </Muted>
          </Card>
          <Pressable style={styles.bell} onPress={() => go('/(owner)/notifications')}>
            <FontAwesome name="bell" size={18} color={Colors.primary} />
            {unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push('/(owner)/(tabs)/more')}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={{ marginTop: Spacing.md }}>
            <ErrorBanner message={error} onRetry={() => void load()} />
          </View>
        ) : null}

        {clinics.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
            {clinics.map((c) => {
              const active = c.organizationId === activeClinic?.organizationId;
              return (
                <Pressable
                  key={c.linkId}
                  onPress={() => {
                    setClinicId(c.organizationId);
                    const first = pets.find((p) => p.organizationId === c.organizationId);
                    if (first) setPetId(first.id);
                  }}
                  style={[styles.clinicChip, active && styles.clinicChipOn]}
                >
                  <Text style={[styles.clinicChipText, active && { color: '#fff' }]}>
                    {c.clinicName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {loading ? (
          <View style={{ marginTop: Spacing.lg, gap: 12 }}>
            <Skeleton height={40} radius={Radii.full} />
            <Skeleton height={160} radius={Radii.xl} />
            <Skeleton height={80} radius={Radii.lg} />
          </View>
        ) : (
          <>
            {clinicPets.length > 0 || pets.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 14 }}
              >
                {(clinicPets.length ? clinicPets : pets).map((p) => {
                  const active = p.id === (selected?.id || petId);
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setPetId(p.id)}
                      style={[styles.petChip, active && styles.petChipActive]}
                    >
                      <FontAwesome
                        name="paw"
                        size={12}
                        color={active ? '#fff' : Colors.primary}
                      />
                      <Text style={[styles.petChipText, active && { color: '#fff' }]}>
                        {p.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            {selected ? (
              <Pressable onPress={() => router.push(`/(owner)/pet/${selected.id}`)}>
                <GradientPetHero
                  name={selected.name}
                  breed={selected.breed}
                  meta={meta || selected.species || 'Pet'}
                  nextCare={nextCare}
                  clinic={selected.clinicName}
                />
              </Pressable>
            ) : (
              <Card>
                <EmptyState
                  title="No pets linked"
                  body="Connect your clinic with an invite code to see pets here."
                  actionLabel="Connect clinic"
                  onAction={() => router.push('/(auth)/connect')}
                />
              </Card>
            )}

            <View style={{ height: Spacing.xl }} />
            <Subtitle>Quick actions</Subtitle>
            <View style={styles.grid}>
              <QuickActionTile
                icon="calendar-plus-o"
                label="Book"
                onPress={() => router.push('/(owner)/(tabs)/book')}
              />
              <QuickActionTile icon="comments" label="Message" onPress={openChat} />
              <QuickActionTile
                icon="file-text-o"
                label="Records"
                onPress={() =>
                  selected
                    ? router.push(`/(owner)/pet/${selected.id}`)
                    : Alert.alert('Select a pet first')
                }
              />
              <QuickActionTile
                icon="exclamation-triangle"
                label="Emergency"
                danger
                onPress={callClinic}
              />
              <QuickActionTile
                icon="medkit"
                label="Medications"
                onPress={() =>
                  selected
                    ? go(`/(owner)/care/${selected.id}?tab=medications`)
                    : Alert.alert('Select a pet first')
                }
              />
              <QuickActionTile
                icon="shield"
                label="Vaccines"
                onPress={() =>
                  selected
                    ? go(`/(owner)/care/${selected.id}?tab=vaccinations`)
                    : Alert.alert('Select a pet first')
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  clinicLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  clinicName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: 4,
  },
  bell: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: Fonts.bold },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarText: { color: '#fff', fontFamily: Fonts.bold },
  clinicChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceMuted,
    marginRight: 8,
  },
  clinicChipOn: { backgroundColor: Colors.primaryDark },
  clinicChipText: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 12 },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceMuted,
    marginRight: 8,
  },
  petChipActive: { backgroundColor: Colors.primary },
  petChipText: { fontFamily: Fonts.semiBold, color: Colors.text, fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: Spacing.md,
    justifyContent: 'space-between',
  },
});
