import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Muted,
  PrimaryButton,
  Skeleton,
  Title,
} from '@/components/ui';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { ownerApi, type MessageThread } from '@/lib/api';
import { go } from '@/lib/nav';

export default function MessagesScreen() {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await ownerApi.messageThreads();
      setThreads(res.threads);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const startChat = async () => {
    const clinic = profile?.clinics[0];
    if (!clinic) return;
    setOpening(true);
    try {
      const res = await ownerApi.openThread(clinic.organizationId, clinic.customerId);
      go(`/(owner)/chat/${res.threadId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not open chat');
    } finally {
      setOpening(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={loading ? [] : threads}
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
          <View style={{ gap: 12, marginBottom: Spacing.md }}>
            <Title>Messages</Title>
            <Muted>Chat with your Phoenix clinic about care and appointments.</Muted>
            {error ? <ErrorBanner message={error} onRetry={() => void load()} /> : null}
            {profile?.clinics[0] ? (
              <PrimaryButton
                label={`Message ${profile.clinics[0].clinicName}`}
                loading={opening}
                onPress={startChat}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={72} radius={Radii.lg} />
              <Skeleton height={72} radius={Radii.lg} />
            </View>
          ) : (
            <Card>
              <EmptyState
                title="No conversations yet"
                body="Start a thread with your linked clinic."
                actionLabel={profile?.clinics[0] ? 'Start chat' : undefined}
                onAction={profile?.clinics[0] ? startChat : undefined}
              />
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => go(`/(owner)/chat/${item.id}`)}
            style={{ marginBottom: 10 }}
          >
            <Card>
              <View style={styles.row}>
                <Text style={styles.clinic}>{item.clinicName}</Text>
                {item.unreadCount > 0 ? (
                  <Badge label={`${item.unreadCount} new`} tone="danger" />
                ) : null}
              </View>
              <Muted>{item.lastMessage || 'No messages yet'}</Muted>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clinic: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
});
