import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { Card, EmptyState, ErrorBanner, Muted, Subtitle, Title } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi } from '@/lib/api';

function LineChartBlock({
  title,
  color,
  points,
  maxValue,
  noOfSections,
}: {
  title: string;
  color: string;
  points: { value: number; label: string }[];
  maxValue?: number;
  noOfSections?: number;
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
        maxValue={maxValue}
        noOfSections={noOfSections}
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

function AgeWeightBarBlock({
  points,
}: {
  points: { value: number; label: string; frontColor: string }[];
}) {
  if (!points.length) return null;
  return (
    <Card style={{ marginBottom: 14 }}>
      <Subtitle>Age vs weight (kg)</Subtitle>
      <Muted style={{ marginTop: 4 }}>Weight recorded at each age</Muted>
      <View style={{ height: 10 }} />
      <BarChart
        data={points}
        barWidth={28}
        spacing={18}
        initialSpacing={12}
        roundedTop
        roundedBottom
        yAxisColor={Colors.border}
        xAxisColor={Colors.border}
        yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
        rulesColor={Colors.border}
        backgroundColor="transparent"
        height={180}
        isAnimated
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

  const bodyCondition = useMemo(
    () =>
      series
        .filter((s) => s.bodyConditionScore != null)
        .map((s) => ({
          value: Number(s.bodyConditionScore),
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

  const ageWeight = useMemo(
    () =>
      series
        .filter((s) => s.weightKg != null && s.ageYears != null)
        .map((s) => ({
          value: Number(s.weightKg),
          label: `${s.ageYears} yr`,
          frontColor: Colors.primary,
        })),
    [series]
  );

  const hasCharts =
    bodyCondition.length > 0 || temp.length > 0 || ageWeight.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Graphs</Title>
        <Muted>Health trends for {name}</Muted>
        <View style={{ height: Spacing.lg }} />
        {error ? <ErrorBanner message={error} /> : null}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
        ) : !hasCharts ? (
          <Card>
            <EmptyState
              title="No chart data yet"
              body="Body condition, temperature, and weight at age from clinic visits will appear here."
            />
          </Card>
        ) : (
          <>
            <LineChartBlock
              title="Body condition (/9)"
              color={Colors.violet}
              points={bodyCondition}
              maxValue={9}
              noOfSections={8}
            />
            <LineChartBlock
              title="Temperature (°C)"
              color={Colors.cyan}
              points={temp}
            />
            <AgeWeightBarBlock points={ageWeight} />
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
