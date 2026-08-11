import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  ErrorBanner,
  Muted,
  SegmentedControl,
  Subtitle,
  Title,
} from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi, type HistoryVisit } from '@/lib/api';

export default function MedsVaxScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const [tab, setTab] = useState(tabParam === 'vaccinations' ? 'Vaccinations' : 'Medications');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryVisit[]>([]);
  const [petName, setPetName] = useState('Pet');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    ownerApi
      .history(id)
      .then((res) => {
        setHistory(res.history);
        setPetName(res.pet.name);
      })
      .catch((err: unknown) => {
        setHistory([]);
        setError(err instanceof Error ? err.message : 'Could not load care records');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const meds = useMemo(() => {
    const rows: { key: string; name: string; detail: string; when: string }[] = [];
    for (const visit of history) {
      for (const rx of visit.prescriptions) {
        for (const [i, item] of (rx.items || []).entries()) {
          rows.push({
            key: `${rx.id}-${i}`,
            name: item.medicineName || 'Medication',
            detail: [item.dosage, item.frequency, item.duration, item.instructions]
              .filter(Boolean)
              .join(' · '),
            when: new Date(rx.createdAt || visit.checkedInAt).toLocaleDateString(),
          });
        }
      }
    }
    return rows;
  }, [history]);

  const vax = useMemo(() => {
    const rows: { key: string; name: string; detail: string; when: string }[] = [];
    for (const visit of history) {
      for (const [i, vaccine] of (visit.vaccines || []).entries()) {
        rows.push({
          key: `${visit.id}-vax-${i}`,
          name: vaccine.name,
          detail: [
            vaccine.lotNumber ? `Lot ${vaccine.lotNumber}` : null,
            vaccine.nextDueDate ? `Next due ${vaccine.nextDueDate}` : null,
          ]
            .filter(Boolean)
            .join(' · '),
          when: vaccine.administeredAt
            ? new Date(vaccine.administeredAt).toLocaleDateString()
            : new Date(visit.checkedInAt).toLocaleDateString(),
        });
      }
      if (
        (visit.visitPurpose || '').toLowerCase() === 'vaccination' &&
        !(visit.vaccines || []).length
      ) {
        rows.push({
          key: `${visit.id}-purpose`,
          name: visit.reason || 'Vaccination visit',
          detail: 'Recorded as vaccination visit',
          when: new Date(visit.checkedInAt).toLocaleDateString(),
        });
      }
    }
    return rows;
  }, [history]);

  const list = tab === 'Vaccinations' ? vax : meds;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>{petName}</Title>
        <Muted>Medications & vaccinations from clinic records.</Muted>
        {error ? (
          <View style={{ marginTop: 12 }}>
            <ErrorBanner message={error} />
          </View>
        ) : null}
        <View style={{ height: 12 }} />
        <SegmentedControl
          options={['Medications', 'Vaccinations']}
          value={tab}
          onChange={setTab}
        />
        <View style={{ height: 14 }} />
        {list.length === 0 ? (
          <Card>
            <EmptyState
              title={tab === 'Vaccinations' ? 'No vaccines yet' : 'No medications yet'}
              body="Records appear after clinic visits."
            />
          </Card>
        ) : (
          list.map((row) => (
            <Card key={row.key} style={{ marginBottom: 10 }}>
              <Subtitle>{row.name}</Subtitle>
              {row.detail ? <Muted>{row.detail}</Muted> : null}
              <Text style={styles.when}>{row.when}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  when: { marginTop: 6, fontSize: 12, fontWeight: '700', color: Colors.textMuted },
});
