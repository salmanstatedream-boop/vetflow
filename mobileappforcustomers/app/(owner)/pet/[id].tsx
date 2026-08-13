import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Card,
  CollapsibleRecord,
  EmptyState,
  GradientPetHero,
  Muted,
  Stepper,
  Subtitle,
} from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi, type CareJourney, type HistoryVisit } from '@/lib/api';
import { go } from '@/lib/nav';

const TABS = ['Overview', 'Records', 'Meds', 'Vaccines', 'Surgery', 'Deworming'] as const;

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

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailTile}>
      <FontAwesome name={icon} size={14} color={Colors.primary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function VisitBody({ visit }: { visit: HistoryVisit }) {
  return (
    <View style={{ gap: 8 }}>
      {visit.notes?.diagnosis ? (
        <Muted>Diagnosis: {String(visit.notes.diagnosis)}</Muted>
      ) : null}
      {visit.notes?.treatmentPlan ? (
        <Muted>Plan: {String(visit.notes.treatmentPlan)}</Muted>
      ) : null}
      {visit.notes?.procedureNotes ? (
        <Muted>Procedure: {String(visit.notes.procedureNotes)}</Muted>
      ) : null}
      {visit.notes?.postOpMedication ? (
        <Muted>Post-op: {String(visit.notes.postOpMedication)}</Muted>
      ) : null}
      {visit.prescriptions.flatMap((rx) =>
        (rx.items || []).map((item, i) => (
          <Muted key={`${rx.id}-${i}`}>
            Rx: {[item.medicineName, item.dosage, item.frequency].filter(Boolean).join(' · ')}
          </Muted>
        ))
      )}
      {(visit.vaccines || []).map((v, i) => (
        <Muted key={`v-${i}`}>Vaccine: {v.name}</Muted>
      ))}
      {(visit.deworming || []).map((d, i) => (
        <Muted key={`d-${i}`}>
          Deworming: {[d.name, d.detail].filter(Boolean).join(' · ')}
        </Muted>
      ))}
    </View>
  );
}

export default function PetDetailScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();
  const initialTab = TABS.includes(tabParam as (typeof TABS)[number])
    ? (tabParam as (typeof TABS)[number])
    : 'Overview';
  const [tab, setTab] = useState<(typeof TABS)[number]>(initialTab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerApi.history>> | null>(
    null
  );
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && TABS.includes(tabParam as (typeof TABS)[number])) {
      setTab(tabParam as (typeof TABS)[number]);
    }
  }, [tabParam]);

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
  const age = petAge(pet.dateOfBirth);

  const surgeries = history.filter((v) => v.isSurgery);
  const medVisits = history.filter((v) => v.prescriptions.some((rx) => rx.items?.length));
  const vaxVisits = history.filter(
    (v) =>
      (v.vaccines || []).length > 0 ||
      (v.visitPurpose || '').toLowerCase() === 'vaccination'
  );
  const dewormVisits = history.filter(
    (v) =>
      (v.deworming || []).length > 0 ||
      (v.visitPurpose || '').toLowerCase() === 'deworming'
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.pageTitle}>Your Pets</Text>
          <Pressable onPress={() => go(`/(owner)/care/${pet.id}`)} hitSlop={8}>
            <FontAwesome name="plus-circle" size={22} color={Colors.primary} />
          </Pressable>
        </View>

        <GradientPetHero
          name={pet.name}
          age={age}
          weight={pet.weightKg != null ? `${pet.weightKg} kg` : null}
          gender={pet.gender}
          species={pet.species}
          photoUrl={pet.photoUrl}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabPill, active && styles.tabPillOn]}
              >
                <Text style={[styles.tabPillText, active && { color: '#fff' }]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === 'Overview' ? (
          <View style={{ marginTop: 18, gap: 16 }}>
            <Subtitle>Pet details</Subtitle>
            <View style={styles.detailGrid}>
              <DetailTile icon="paw" label="Species" value={pet.species || '—'} />
              <DetailTile icon="venus-mars" label="Sex" value={pet.gender || '—'} />
              <DetailTile
                icon="balance-scale"
                label="Weight"
                value={pet.weightKg != null ? `${pet.weightKg} kg` : '—'}
              />
              <DetailTile icon="birthday-cake" label="Age" value={age || '—'} />
            </View>

            {journey ? (
              <Card>
                <Subtitle>Live care journey</Subtitle>
                <View style={{ height: 10 }} />
                <Stepper steps={journey.steps} activeIndex={journey.activeIndex} />
              </Card>
            ) : (
              <Card>
                <Subtitle>Care journey</Subtitle>
                <View style={{ height: 10 }} />
                <Stepper steps={fallbackSteps} activeIndex={0} />
              </Card>
            )}

            <View style={styles.sectionHead}>
              <Subtitle>Care timeline</Subtitle>
              <Pressable onPress={() => setTab('Records')}>
                <Text style={styles.link}>View all</Text>
              </Pressable>
            </View>
            {history.slice(0, 4).map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                title={visit.reason || visit.visitPurpose || 'Visit'}
                badge={visit.status}
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            {!history.length ? (
              <Card>
                <EmptyState title="No visits yet" body="Clinic visits will appear here." />
              </Card>
            ) : null}
          </View>
        ) : null}

        {tab === 'Records' ? (
          <View style={{ marginTop: 18 }}>
            {history.map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString()}
                title={visit.reason || 'Clinical visit'}
                badge={visit.status}
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            {!history.length ? (
              <Card>
                <EmptyState title="No records" body="Records appear after clinic visits." />
              </Card>
            ) : null}
          </View>
        ) : null}

        {tab === 'Meds' ? (
          <View style={{ marginTop: 18 }}>
            {medVisits.map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString()}
                title={visit.reason || 'Prescriptions'}
                badge="Meds"
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push(`/(owner)/care/${pet.id}?tab=medications`)}
            >
              <Text style={styles.link}>Open medical record</Text>
            </Pressable>
            {!medVisits.length ? (
              <Card>
                <EmptyState title="No medications" body="Clinic prescriptions will show here." />
              </Card>
            ) : null}
          </View>
        ) : null}

        {tab === 'Vaccines' ? (
          <View style={{ marginTop: 18 }}>
            {vaxVisits.map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString()}
                title={visit.reason || 'Vaccination'}
                badge="Vaccine"
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            {!vaxVisits.length ? (
              <Card>
                <EmptyState title="No vaccines" body="Vaccination records will show here." />
              </Card>
            ) : null}
          </View>
        ) : null}

        {tab === 'Surgery' ? (
          <View style={{ marginTop: 18 }}>
            {surgeries.map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString()}
                title={visit.reason || 'Surgery'}
                badge="Surgery"
                defaultOpen
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            {!surgeries.length ? (
              <Card>
                <EmptyState title="No surgeries" body="Surgical visits will appear here." />
              </Card>
            ) : null}
          </View>
        ) : null}

        {tab === 'Deworming' ? (
          <View style={{ marginTop: 18 }}>
            {dewormVisits.map((visit) => (
              <CollapsibleRecord
                key={visit.id}
                meta={new Date(visit.checkedInAt).toLocaleDateString()}
                title={visit.reason || 'Deworming'}
                badge="Deworming"
              >
                <VisitBody visit={visit} />
              </CollapsibleRecord>
            ))}
            {!dewormVisits.length ? (
              <Card>
                <EmptyState title="No deworming" body="Deworming records will show here." />
              </Card>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  pad: { flex: 1, padding: Spacing.xl, backgroundColor: Colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pageTitle: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.text },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tabPillOn: { backgroundColor: Colors.primary },
  tabPillText: { fontFamily: Fonts.semiBold, color: Colors.textMuted, fontSize: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailTile: {
    width: '48%',
    backgroundColor: Colors.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 14,
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.text },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { color: Colors.primary, fontFamily: Fonts.bold, fontSize: 13 },
  linkRow: { marginTop: 8, marginBottom: 8 },
});
