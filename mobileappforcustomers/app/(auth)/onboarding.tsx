import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Fonts } from '@/constants/theme';
import { Muted, PrimaryButton, Title } from '@/components/ui';
import { storage } from '@/lib/storage';

const SLIDES = [
  {
    icon: 'paw' as const,
    title: 'Everything about your pet. In one place.',
    body: 'Keep medical records, appointments, prescriptions and important updates together.',
  },
  {
    icon: 'heart' as const,
    title: "Care doesn't stop at the clinic.",
    body: 'Get reminders, follow-up care, emergency access and personalized recommendations.',
  },
  {
    icon: 'hospital-o' as const,
    title: 'Connect with your Phoenix clinic.',
    body: 'Scan a clinic QR or enter your invitation code to unlock your pets across locations.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    await storage.setOnboardingDone();
    router.replace('/(auth)/welcome');
  };

  const dots = useMemo(
    () =>
      SLIDES.map((_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
      )),
    [index]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={finish} style={styles.skip} hitSlop={12}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <FontAwesome name={slide.icon} size={40} color={Colors.primary} />
        </View>
        <Title>{slide.title}</Title>
        <Muted>{slide.body}</Muted>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>{dots}</View>
        <PrimaryButton
          label={last ? 'Get Started →' : 'Continue →'}
          onPress={() => {
            if (last) void finish();
            else setIndex((v) => v + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  skip: { alignSelf: 'flex-end' },
  skipText: { color: Colors.textMuted, fontFamily: Fonts.semiBold },
  center: { flex: 1, justifyContent: 'center', gap: 14, paddingHorizontal: 8 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  footer: { gap: 16, paddingBottom: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { width: 22, backgroundColor: Colors.primary },
});
