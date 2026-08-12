import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { Card, EmptyState, ErrorBanner, Muted, Subtitle, Title } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi } from '@/lib/api';

function ChartBlock({
  title,
  color,
  points,
}: {
  title: string;
  color: string;
  points: { value: number; label: string }[];
}) {
  if (!points.length) return null;
  return (
    <Card style={{ marginBottom: 14 }}>
      <Subtitle>{title}</Subtitle>
      <View style={{ height: 10 }} />
      <LineChart
        data={points}
        color={color}
        thickness={2}
        hideDataPoints={points.length > 12}
        dataPointsColor={color}
        startFillColor={color}
        endFillColor={Colors.background}
        startOpacity={0.25}
        endOpacity={0.02}
        areaChart
        yAxisColor={Colors.border}
        xAxisColor={Colors.border}
        yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
        rulesColor={Colors.border}
        backgroundColor="transparent"
        height={160}
      />
    </Card>
  );
}

export default function GraphsScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('Pet');
  const [series, setSeries] = useState<
    Awaited<ReturnType<typeof ownerApi.metrics>>['series']
  >([]);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    ownerApi
      .metrics(petId)
      .then((res) => {
        setName(res.pet.name);
        setSeries(res.series);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load graphs');
        setSeries([]);
      })
      .finally(() => setLoading(false));
  }, [petId]);

  const weight = useMemo(
    () =>
      series
        .filter((s) => s.weightKg != null)
        .map((s) => ({
          value: Number(s.weightKg),
          label: new Date(s.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        })),
    [series]
  );
  const temp = useMemo(
    () =>
      series
        .filter((s) => s.temperatureC != null)
        .map((s) => ({
          value: Number(s.temperatureC),
          label: new Date(s.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        })),
    [series]
  );
  const hr = useMemo(
    () =>
      series
        .filter((s) => s.heartRateBpm != null)
        .map((s) => ({
          value: Number(s.heartRateBpm),
          label: new Date(s.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
        })),
    [series]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Graphs</Title>
        <Muted>Health trends for {name}</Muted>
        <View style={{ height: Spacing.lg }} />
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
        ) : !weight.length && !temp.length && !hr.length ? (
          <Card>
            <EmptyState
              title="No chart data yet"
              body="Vitals recorded in clinic visits will appear as graphs here."
            />
          </Card>
        ) : (
          <>
            <ChartBlock title="Weight (kg)" color={Colors.primary} points={weight} />
            <ChartBlock title="Temperature (°C)" color={Colors.cyan} points={temp} />
            <ChartBlock title="Heart rate (bpm)" color={Colors.violet} points={hr} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
});
