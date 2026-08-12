import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  CollapsibleRecord,
  EmptyState,
  ErrorBanner,
  Muted,
  Title,
} from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { ownerApi, type HistoryVisit } from '@/lib/api';

export default function SurgeryScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryVisit[]>([]);
  const [name, setName] = useState('Pet');

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    ownerApi
      .history(petId)
      .then((res) => {
        setHistory(res.history);
        setName(res.pet.name);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load surgery timeline');
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [petId]);

  const surgeries = useMemo(
    () => history.filter((v) => v.isSurgery),
    [history]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Surgery</Title>
        <Muted>Procedure timeline for {name}</Muted>
        <View style={{ height: Spacing.lg }} />
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
        ) : surgeries.length === 0 ? (
          <Card>
            <EmptyState
              title="No surgery records"
              body="Surgical visits from the clinic will appear here as collapsible timelines."
            />
          </Card>
        ) : (
          surgeries.map((visit) => (
            <CollapsibleRecord
              key={visit.id}
              defaultOpen
              meta={new Date(visit.checkedInAt).toLocaleDateString()}
              title={visit.reason || 'Surgery'}
              badge={visit.status}
            >
              {visit.notes?.procedureNotes ? (
                <Muted>Procedure: {String(visit.notes.procedureNotes)}</Muted>
              ) : null}
              {visit.notes?.diagnosis ? (
                <Muted>Diagnosis: {String(visit.notes.diagnosis)}</Muted>
              ) : null}
              {visit.notes?.postOpMedication ? (
                <Muted>Post-op: {String(visit.notes.postOpMedication)}</Muted>
              ) : null}
              {visit.notes?.followUp ? (
                <Muted>Follow-up: {String(visit.notes.followUp)}</Muted>
              ) : null}
              {visit.prescriptions.flatMap((rx) =>
                (rx.items || []).map((item, i) => (
                  <Muted key={`${rx.id}-${i}`}>
                    Rx: {[item.medicineName, item.dosage, item.frequency]
                      .filter(Boolean)
                      .join(' · ')}
                  </Muted>
                ))
              )}
            </CollapsibleRecord>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
});
