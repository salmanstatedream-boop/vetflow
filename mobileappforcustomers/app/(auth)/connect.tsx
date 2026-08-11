import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Field,
  Label,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Title,
} from '@/components/ui';
import ScanQrPanel from '@/components/ScanQrPanel';
import { Colors, Spacing } from '@/constants/theme';
import { ownerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { extractInviteToken, type PhoenixCareQrPayload } from '@/lib/qr';

export default function ConnectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { session, refreshProfile } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [codeMode, setCodeMode] = useState(Boolean(params.token));
  const [token, setToken] = useState(params.token || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void storage.getPendingInvite().then((pending) => {
      if (pending) {
        setToken(pending);
        setCodeMode(true);
      }
    });
  }, []);

  const accept = async (raw?: string) => {
    if (!session) {
      router.replace('/(auth)/login');
      return;
    }
    const value = extractInviteToken(raw || token);
    if (value.trim().length < 10) {
      Alert.alert('Enter a valid invitation code');
      return;
    }
    setLoading(true);
    try {
      await ownerApi.acceptInvite(value.trim());
      await storage.clearPendingInvite();
      await refreshProfile();
      Alert.alert('Clinic linked', 'Your pets are now available in Phoenix Care.');
      router.replace('/(owner)/(tabs)');
    } catch (err: unknown) {
      Alert.alert('Invite failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const onScanResult = (payload: PhoenixCareQrPayload, raw: string) => {
    if (payload.kind === 'login') {
      setScanning(false);
      Alert.alert(
        'Login QR detected',
        'That code is for signing in. Open Sign in and scan it there.',
        [
          {
            text: 'Go to sign in',
            onPress: () =>
              router.replace({
                pathname: '/(auth)/login',
                params: { scan: '1' },
              }),
          },
          { text: 'OK' },
        ]
      );
      return;
    }
    setToken(payload.token || extractInviteToken(raw));
    setScanning(false);
    void accept(payload.token || raw);
  };

  if (scanning) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScanQrPanel
          title="Scan invite QR"
          hint="Clinic invitation QR codes look like phoenixcare://invite/…"
          onResult={onScanResult}
          onCancel={() => setScanning(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.block}>
        <Title>Connect your clinic</Title>
        <Muted>Scan a clinic invite QR, pick a saved image, or paste the invitation code.</Muted>
        <View style={{ height: Spacing.xl }} />

        {!codeMode ? (
          <>
            <PrimaryButton label="Scan QR code" onPress={() => setScanning(true)} />
            <View style={{ height: 10 }} />
            <PrimaryButton label="Use invitation code" onPress={() => setCodeMode(true)} />
            <View style={{ height: 10 }} />
            <SecondaryButton
              label={session ? 'Skip for now' : 'Sign in first'}
              onPress={() =>
                session ? router.replace('/(owner)/(tabs)') : router.replace('/(auth)/login')
              }
            />
          </>
        ) : (
          <>
            <Label>Invitation code</Label>
            <Field
              autoCapitalize="none"
              value={token}
              onChangeText={setToken}
              placeholder="Paste invite token"
            />
            <View style={{ height: Spacing.lg }} />
            <PrimaryButton label="Link clinic" onPress={() => void accept()} loading={loading} />
            <View style={{ height: 10 }} />
            <SecondaryButton
              label="Back to scan"
              onPress={() => {
                setCodeMode(false);
                setScanning(false);
              }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  block: { gap: 4, paddingTop: Spacing.sm },
});
