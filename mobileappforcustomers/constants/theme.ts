export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#DBEAFE',
  cyan: '#22d3ee',
  blue: '#3B82F6',
  violet: '#7C3AED',
  gradientStart: '#6366F1',
  gradientEnd: '#2563EB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#059669',
  successSoft: '#D1FAE5',
  onPrimary: '#FFFFFF',
  darkCard: '#0F172A',
};

export const Brand = {
  appName: 'Phoenix Care',
  tagline: 'by Phoenix OS',
  scheme: 'phoenixcare',
  description:
    'Book appointments and view your pets’ medical history across every Phoenix OS clinic you’re linked to.',
  keywords:
    'veterinary,pet owner,appointment booking,pet medical records,phoenix care,vet clinic,animal hospital',
};

/** Plus Jakarta Sans — loaded in root layout via @expo-google-fonts */
export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const Type = {
  display: { fontSize: 30, lineHeight: 36, fontFamily: Fonts.bold, letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  section: { fontSize: 17, lineHeight: 24, fontFamily: Fonts.bold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: Fonts.regular },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontFamily: Fonts.semiBold },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: Fonts.medium },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.bold,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const Radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 999,
};

export const Layout = {
  screenPad: Spacing.xl,
  buttonHeight: 52,
  inputHeight: 50,
  tabBarHeight: 68,
};
