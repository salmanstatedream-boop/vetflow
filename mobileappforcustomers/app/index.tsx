import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Brand, Colors, Fonts } from '@/constants/theme';
import { consumeBootSplash, storage } from '@/lib/storage';
import { useAuth } from '@/lib/auth';

const SPLASH_MS = 1100;

export default function SplashScreen() {
  const router = useRouter();
  const { ready, session, profile } = useAuth();
  const [reduceMotion, setReduceMotion] = useState(false);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(10);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      logoOpacity.value = 1;
      logoY.value = 0;
      textOpacity.value = 1;
      return;
    }
    logoOpacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    logoY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
    textOpacity.value = withDelay(180, withTiming(1, { duration: 360 }));
  }, [reduceMotion, logoOpacity, logoY, textOpacity]);

  useEffect(() => {
    if (!ready) return;
    const delay = reduceMotion ? 250 : SPLASH_MS;
    const t = setTimeout(async () => {
      const onboardingDone = await storage.getOnboardingDone();
      if (!session) {
        if (!onboardingDone) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(auth)/welcome');
        }
        return;
      }
      if (profile?.defaultMode === 'staff' && !profile.isOwner) {
        router.replace('/(staff)/dashboard');
        return;
      }
      if ((profile?.clinics?.length ?? 0) === 0) {
        router.replace('/(auth)/connect');
        return;
      }
      router.replace('/(owner)/(tabs)');
    }, delay);
    return () => clearTimeout(t);
  }, [ready, session, profile, router, reduceMotion]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  return (
    <View style={styles.root} accessibilityLabel="Phoenix Care loading">
      <View style={styles.glow} />
      <Animated.View style={logoStyle}>
        <Image
          source={require('../assets/images/phoenix-logo-mark.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Phoenix Care"
        />
      </Animated.View>
      <Animated.View style={[styles.copy, textStyle]}>
        <Text style={styles.title}>{Brand.appName}</Text>
        <Text style={styles.tag}>{Brand.tagline}</Text>
      </Animated.View>
    </View>
  );
}

export function shouldShowSplash() {
  return consumeBootSplash();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primarySoft,
  },
  logo: { width: 88, height: 88 },
  copy: { alignItems: 'center', gap: 6 },
  title: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tag: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: Fonts.semiBold,
  },
});
