import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, Fonts, Radii, Spacing } from '@/constants/theme';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function WelcomeScreen() {
  const { configured } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glowOuter} pointerEvents="none" />
      <View style={styles.glowInner} pointerEvents="none" />
      <View style={styles.body}>
        <View style={styles.brandBlock}>
          <Image
            source={require('../../assets/images/phoenix-logo-mark.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Phoenix Care logo"
          />
          <Text style={styles.brand}>{Brand.appName}</Text>
          <Text style={styles.tagline}>{Brand.tagline}</Text>
          <Text style={styles.description}>{Brand.description}</Text>
          {!configured ? (
            <View style={styles.warn}>
              <Text style={styles.warnText}>
                Configure EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, and
                EXPO_PUBLIC_APP_URL to continue.
              </Text>
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
          <View style={styles.textActions}>
            <TextButton
              label="Password from clinic"
              onPress={() => router.push('/(auth)/login')}
              disabled={!configured}
            />
            <TextButton
              label="I have an invite code"
              onPress={() => router.push('/(auth)/connect')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glowOuter: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.07)',
  },
  glowInner: {
    position: 'absolute',
    top: '28%',
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.md,
  },
  brand: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.blue,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  description: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  warn: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: Colors.dangerSoft,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(248, 113, 113, 0.28)',
    alignSelf: 'stretch',
  },
  warnText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    color: Colors.danger,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    paddingBottom: Spacing.sm,
  },
  textActions: {
    marginTop: 6,
    gap: 2,
    alignItems: 'center',
  },
});
