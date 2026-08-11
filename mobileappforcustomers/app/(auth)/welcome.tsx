import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { Muted, PrimaryButton, SecondaryButton, Title } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function WelcomeScreen() {
  const { configured } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/phoenix-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Phoenix Care logo"
          />
        </View>
        <Title>{Brand.appName}</Title>
        <Muted>{Brand.tagline}</Muted>
        <Muted>{Brand.description}</Muted>
        {!configured ? (
          <View style={styles.warn}>
            <Muted>
              Configure EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, and
              EXPO_PUBLIC_APP_URL to continue.
            </Muted>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label="Sign in with email"
          onPress={() => router.push('/(auth)/login')}
          disabled={!configured}
        />
        <SecondaryButton
          label="Scan login QR"
          onPress={() => router.push({ pathname: '/(auth)/login', params: { scan: '1' } })}
          disabled={!configured}
        />
        <SecondaryButton
          label="Password from clinic"
          onPress={() => router.push('/(auth)/login')}
          disabled={!configured}
        />
        <SecondaryButton
          label="I have an invite code"
          onPress={() => router.push('/(auth)/connect')}
        />
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
  hero: {
    gap: Spacing.md,
    paddingTop: Spacing.xxxl,
  },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: Radii.xl,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 88,
    height: 88,
  },
  warn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.dangerSoft,
  },
  actions: { gap: 10, paddingBottom: Spacing.sm },
});
