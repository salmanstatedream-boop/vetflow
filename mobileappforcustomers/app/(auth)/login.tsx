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
  SegmentedControl,
  Title,
} from '@/components/ui';
import ScanQrPanel from '@/components/ScanQrPanel';
import { Colors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { ownerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { PhoenixCareQrPayload } from '@/lib/qr';

type Mode = 'Email code' | 'Password';

async function routeAfterAuth(
  router: ReturnType<typeof useRouter>,
  refreshProfile: () => Promise<void>
) {
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
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ invite?: string; scan?: string }>();
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<Mode>('Email code');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(params.invite || '');
  const [scanning, setScanning] = useState(params.scan === '1');

  useEffect(() => {
    if (params.invite) setInvite(params.invite);
    else {
      void storage.getPendingInvite().then((t) => {
        if (t) setInvite(t);
      });
    }
  }, [params.invite]);

  useEffect(() => {
    if (params.scan === '1') setScanning(true);
  }, [params.scan]);

  const sendOtp = async () => {
    const value = email.trim().toLowerCase();
    if (!value.includes('@')) {
      Alert.alert('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: value,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      router.push({
        pathname: '/(auth)/otp',
        params: { email: value, invite: invite || undefined },
      });
    } catch (err: unknown) {
      Alert.alert('Could not send code', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (overrideEmail?: string, overridePassword?: string) => {
    const value = (overrideEmail ?? email).trim().toLowerCase();
    const pass = overridePassword ?? password;
    if (!value.includes('@') || pass.length < 6) {
      Alert.alert('Enter email and password from your clinic');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: value,
        password: pass,
      });
      if (error) throw error;
      if (invite.trim()) {
        try {
          await ownerApi.acceptInvite(invite.trim());
          await storage.clearPendingInvite();
        } catch {
          /* may already be linked */
        }
      }
      await routeAfterAuth(router, refreshProfile);
    } catch (err: unknown) {
      Alert.alert('Sign in failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const onScanResult = async (payload: PhoenixCareQrPayload) => {
    if (payload.kind === 'invite') {
      await storage.setPendingInvite(payload.token);
      setInvite(payload.token);
      setScanning(false);
      setMode('Email code');
      Alert.alert(
        'Invite saved',
        'Sign in with email code or password, then your clinic will link.'
      );
      return;
    }
    setEmail(payload.email);
    setPassword(payload.password);
    setScanning(false);
    setMode('Password');
    await signInWithPassword(payload.email, payload.password);
  };

  if (scanning) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScanQrPanel
          title="Scan login QR"
          hint="Use the QR your clinic downloaded or emailed — camera or photo library."
          onResult={(payload) => void onScanResult(payload)}
          onCancel={() => setScanning(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.block}>
        <SecondaryButton label="← Back" onPress={() => router.back()} />
        <View style={{ height: Spacing.xl }} />
        <Title>Sign in</Title>
        <Muted>
          {mode === 'Email code'
            ? 'We’ll email a one-time code — no password needed.'
            : 'Use the login ID and password from your clinic QR.'}
        </Muted>
        <View style={{ height: Spacing.lg }} />
        <SegmentedControl
          options={['Email code', 'Password']}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
        <View style={{ height: Spacing.lg }} />
        <Label>Email</Label>
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          returnKeyType={mode === 'Email code' ? 'go' : 'next'}
          onSubmitEditing={() => {
            if (mode === 'Email code') void sendOtp();
          }}
        />
        {mode === 'Password' ? (
          <>
            <View style={{ height: Spacing.md }} />
            <Label>Password</Label>
            <Field
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              placeholder="Clinic-issued password"
              returnKeyType="go"
              onSubmitEditing={() => void signInWithPassword()}
            />
          </>
        ) : null}
        {invite ? (
          <>
            <View style={{ height: Spacing.md }} />
            <Muted>Invite ready to apply after sign-in.</Muted>
          </>
        ) : null}
      </View>
      <View style={{ gap: 10 }}>
        {mode === 'Email code' ? (
          <PrimaryButton label="Send code" onPress={sendOtp} loading={loading} />
        ) : (
          <PrimaryButton
            label="Sign in"
            onPress={() => void signInWithPassword()}
            loading={loading}
          />
        )}
        <SecondaryButton label="Scan clinic QR" onPress={() => setScanning(true)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  block: { gap: 4, paddingTop: Spacing.sm },
});
