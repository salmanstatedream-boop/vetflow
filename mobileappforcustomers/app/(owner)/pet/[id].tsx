import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  EmptyState,
  GradientPetHero,
  Muted,
  PrimaryButton,
  Stepper,
  Subtitle,
  TimelineCard,
} from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi, type CareJourney } from '@/lib/api';
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

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerApi.history>> | null>(
    null
  );
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [hist, care] = await Promise.all([
        ownerApi.history(id),
        ownerApi.careJourney(id),
      ]);
      setData(hist);
      setJourney(care.active);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const t = setInterval(() => {
      if (!id) return;
      void ownerApi.careJourney(id).then((r) => setJourney(r.active)).catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [id, load]);

  const fallbackSteps = useMemo(
    () => [
      { title: 'Checked in', subtitle: 'Waiting for an active visit' },
      { title: 'With doctor', subtitle: 'Exam & diagnosis' },
      { title: 'Treatment', subtitle: 'Care in progress' },
      { title: 'Ready for pickup', subtitle: 'Discharge & follow-up' },
    ],
    []
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.pad}>
        <Card>
          <EmptyState
            title="Couldn’t load pet"
            body={error || 'Try again later.'}
            actionLabel="Retry"
            onAction={() => {
              setLoading(true);
              void load();
            }}
          />
        </Card>
      </SafeAreaView>
    );
  }

  const { pet, history } = data;
  const meta = [
    petAge(pet.dateOfBirth),
    pet.weightKg != null ? `${pet.weightKg} kg` : null,
    pet.gender,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <GradientPetHero
          name={pet.name}
          breed={pet.breed}
          meta={meta || pet.species || 'Pet'}
          clinic={pet.clinicName}
          nextCare={journey ? `${journey.stageLabel} · ${journey.reason}` : null}
        />

        <View style={{ height: 14 }} />
        <View style={styles.rowBtns}>
          <Pressable
            style={styles.linkBtn}
            onPress={() => go(`/(owner)/care/${pet.id}?tab=medications`)}
          >
            <Text style={styles.linkText}>Medications</Text>
          </Pressable>
          <Pressable
            style={styles.linkBtn}
            onPress={() => go(`/(owner)/care/${pet.id}?tab=vaccinations`)}
          >
            <Text style={styles.linkText}>Vaccinations</Text>
          </Pressable>
        </View>

        {pet.allergies ? (
          <Card style={{ marginTop: 12 }}>
            <Subtitle>Allergies</Subtitle>
            <Muted>{pet.allergies}</Muted>
          </Card>
        ) : null}

        <View style={{ height: 20 }} />
        <Subtitle>Care journey</Subtitle>
        <Muted>
          {journey
            ? `Live · ${journey.clinicName} · ${journey.stageLabel}`
            : 'Live stages appear when your pet is checked in.'}
        </Muted>
        <View style={{ height: 10 }} />
        <Card>
          <Stepper
            steps={journey?.steps || fallbackSteps}
            activeIndex={journey?.activeIndex ?? 0}
          />
        </Card>

        <View style={{ height: 20 }} />
        <Subtitle>Medical history</Subtitle>
        <Muted>Visit timeline from your Phoenix clinics.</Muted>
        <View style={{ height: 10 }} />
        {history.length === 0 ? (
          <Card>
            <EmptyState title="No visits yet" body="History appears after clinic visits." />
          </Card>
        ) : (
          history.map((v) => {
            const noteParts = [
              v.notes?.diagnosis ? `Diagnosis: ${v.notes.diagnosis}` : null,
              v.notes?.treatmentPlan ? `Plan: ${v.notes.treatmentPlan}` : null,
              v.prescriptions?.length
                ? `${v.prescriptions.length} prescription(s)`
                : null,
              v.vaccines?.length ? `${v.vaccines.length} vaccine(s)` : null,
            ].filter(Boolean);
            return (
              <TimelineCard
                key={v.id}
                date={new Date(v.checkedInAt).toLocaleDateString()}
                status={v.status}
                title={v.reason}
                subtitle={v.isEmergency ? 'Emergency visit' : v.visitPurpose || undefined}
                note={noteParts.join(' · ') || undefined}
              />
            );
          })
        )}
        <View style={{ height: 12 }} />
        <PrimaryButton label="Refresh" onPress={() => void load()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pad: { padding: Spacing.xl, paddingBottom: 48 },
  rowBtns: { flexDirection: 'row', gap: 10 },
  linkBtn: {
    flex: 1,
    backgroundColor: Colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkText: { fontFamily: Fonts.bold, color: Colors.primaryDark },
});
