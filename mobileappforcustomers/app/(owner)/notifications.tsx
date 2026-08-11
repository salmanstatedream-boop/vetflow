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
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Title,
} from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { ownerApi, type OwnerNotification } from '@/lib/api';

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<OwnerNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await ownerApi.notifications();
      setItems(res.notifications);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load notifications');
      setItems([]);
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
        data={items}
        keyExtractor={(n) => n.id}
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
          <View style={{ gap: 10, marginBottom: 12 }}>
            <SecondaryButton label="← Back" onPress={() => router.back()} />
            <Title>Notifications</Title>
            {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}
            <PrimaryButton
              label="Mark all read"
              onPress={async () => {
                await ownerApi.markNotificationsRead(true);
                await load();
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <Card>
            <EmptyState
              title="You're all caught up"
              body="Appointment updates and clinic messages will appear here."
            />
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={async () => {
              if (!item.readAt) {
                await ownerApi.markNotificationsRead(false, [item.id]);
                await load();
              }
            }}
            style={{ marginBottom: 10 }}
          >
            <Card style={!item.readAt ? styles.unread : undefined}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                {!item.readAt ? <Badge label="New" /> : null}
              </View>
              <Muted>{item.body}</Muted>
              <Muted>{new Date(item.createdAt).toLocaleString()}</Muted>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontWeight: '800', color: Colors.text, flex: 1, marginRight: 8 },
  unread: { borderColor: Colors.primary, borderWidth: 1.5 },
});
