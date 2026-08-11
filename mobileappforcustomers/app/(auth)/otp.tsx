import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Field, Label, Muted, PrimaryButton, SecondaryButton, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { ownerApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';

export default function OtpScreen() {
  const { email, invite: inviteParam } = useLocalSearchParams<{
    email: string;
    invite?: string;
  }>();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [invite, setInvite] = useState(inviteParam || '');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!email) return;
    if (code.trim().length < 6) {
      Alert.alert('Enter the 6+ digit code from your email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'email',
      });
      if (error) throw error;

      if (invite.trim()) {
        await ownerApi.acceptInvite(invite.trim());
        await storage.clearPendingInvite();
      }
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
    } catch (err: unknown) {
      Alert.alert('Verification failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.block}>
        <Title>Enter code</Title>
        <Muted>We sent a one-time code to {email}</Muted>
        <View style={{ height: 16 }} />
        <Label>Code</Label>
        <Field
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
        />
        <View style={{ height: 12 }} />
        <Label>Invite code (optional)</Label>
        <Field
          autoCapitalize="none"
          value={invite}
          onChangeText={setInvite}
          placeholder="Paste clinic invite token"
        />
      </View>
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Continue" onPress={verify} loading={loading} />
        <SecondaryButton label="Back" onPress={() => router.back()} />
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
  block: { gap: 8, paddingTop: Spacing.xl },
});
