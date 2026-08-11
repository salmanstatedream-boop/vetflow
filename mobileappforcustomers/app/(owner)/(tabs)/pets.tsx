import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Muted,
  Skeleton,
  Title,
} from '@/components/ui';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { ownerApi, type OwnerPet } from '@/lib/api';

export default function PetsScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<OwnerPet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await ownerApi.pets();
      setPets(res.pets);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load pets');
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={loading ? [] : pets}
        keyExtractor={(item) => item.id}
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
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.lg, gap: 8 }}>
            <Title>Your pets</Title>
            <Muted>All pets linked across your Phoenix clinics.</Muted>
            {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={88} radius={Radii.lg} />
              <Skeleton height={88} radius={Radii.lg} />
            </View>
          ) : (
            <Card>
              <EmptyState
                title="No pets yet"
                body="Connect a clinic with your invitation code to unlock pet profiles."
                actionLabel="Connect clinic"
                onAction={() => router.push('/(auth)/connect')}
              />
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(owner)/pet/${item.id}`)}
            style={{ marginBottom: 10 }}
          >
            <Card>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <FontAwesome name="paw" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Badge label={item.clinicName} />
                  <Text style={styles.name}>{item.name}</Text>
                  <Muted>
                    {[item.species, item.breed, item.gender].filter(Boolean).join(' · ') ||
                      'Pet'}
                  </Muted>
                </View>
                <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 6,
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
});
