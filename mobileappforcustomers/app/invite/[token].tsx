import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Muted, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { ownerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';

/** Deep link: phoenixcare://invite/<token> */
export default function InviteDeepLinkScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session, ready, refreshProfile } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('Opening invite…');

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      if (!token) {
        router.replace('/');
        return;
      }
      await storage.setPendingInvite(token);
      if (!session) {
        setMessage('Sign in to connect your clinic');
        router.replace({
          pathname: '/(auth)/login',
          params: { invite: token },
        });
        return;
      }
      try {
        await ownerApi.acceptInvite(token);
        await refreshProfile();
        await storage.clearPendingInvite();
        router.replace('/(owner)/(tabs)');
      } catch {
        setMessage('Could not accept invite — enter code manually');
        router.replace({
          pathname: '/(auth)/connect',
          params: { token },
        });
      }
    };
    void run();
  }, [ready, session, token, refreshProfile, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
        <Title>Phoenix Care</Title>
        <Muted>{message}</Muted>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
