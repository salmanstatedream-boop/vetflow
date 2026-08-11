import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Muted, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ownerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/** Deep link: phoenixcare://login?email=…&password=… */
export default function LoginDeepLinkScreen() {
  const params = useLocalSearchParams<{ email?: string; password?: string }>();
  const { ready, refreshProfile } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('Signing in…');

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const email = (params.email || '').trim().toLowerCase();
      const password = params.password || '';
      if (!email.includes('@') || password.length < 6) {
        router.replace({ pathname: '/(auth)/login', params: { scan: '1' } });
        return;
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refreshProfile();
        let me: Awaited<ReturnType<typeof ownerApi.me>> | null = null;
        try {
          me = await ownerApi.me();
        } catch {
          me = null;
        }
        if (me?.defaultMode === 'staff' && !me.isOwner) {
          router.replace('/(staff)/dashboard');
        } else if ((me?.clinics?.length ?? 0) === 0) {
          router.replace('/(auth)/connect');
        } else {
          router.replace('/(owner)/(tabs)');
        }
      } catch {
        setMessage('Could not sign in from QR — enter credentials manually');
        router.replace({
          pathname: '/(auth)/login',
          params: {},
        });
      }
    };
    void run();
  }, [ready, params.email, params.password, refreshProfile, router]);

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
});
