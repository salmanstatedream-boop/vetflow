import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Muted, SecondaryButton } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { APP_URL, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function StaffDashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inject, setInject] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) throw new Error('Not signed in');

        const projectRef = (() => {
          try {
            return new URL(process.env.EXPO_PUBLIC_SUPABASE_URL || '').hostname.split('.')[0];
          } catch {
            return 'sb';
          }
        })();

        const storageKey = `sb-${projectRef}-auth-token`;
        const payload = JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: 'bearer',
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          user: session.user,
        });

        const script = `
          (function() {
            try {
              localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(payload)});
            } catch (e) {}
            true;
          })();
        `;

        await fetch(`${APP_URL}/api/mobile/session`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          }),
        }).catch(() => null);

        if (!cancelled) {
          setInject(script);
          setReady(true);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to open dashboard');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const source = useMemo(() => ({ uri: `${APP_URL}/dashboard` }), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.bar}>
        {profile?.isOwner ? (
          <SecondaryButton label="Back to Phoenix Care" onPress={() => router.replace('/(owner)/(tabs)')} />
        ) : (
          <SecondaryButton
            label="Sign out"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/(auth)/welcome');
            }}
          />
        )}
      </View>
      {error ? (
        <View style={styles.center}>
          <Muted>{error}</Muted>
        </View>
      ) : !ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
          <Muted>Opening clinic dashboard…</Muted>
        </View>
      ) : (
        <WebView
          source={source}
          style={styles.webview}
          startInLoadingState
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          injectedJavaScriptBeforeContentLoaded={inject || undefined}
          allowsBackForwardNavigationGestures
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  bar: { paddingHorizontal: 16, paddingVertical: 8 },
  webview: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
});
