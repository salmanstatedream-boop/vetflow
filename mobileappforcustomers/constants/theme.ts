export const Colors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primarySoft: 'rgba(59, 130, 246, 0.18)',
  cyan: '#22d3ee',
  blue: '#60A5FA',
  violet: '#8B5CF6',
  gradientStart: '#4F46E5',
  gradientEnd: '#2563EB',
  background: '#070B14',
  backgroundElevated: '#0C1220',
  surface: 'rgba(255, 255, 255, 0.07)',
  surfaceSolid: '#121A2B',
  surfaceMuted: 'rgba(255, 255, 255, 0.05)',
  glass: 'rgba(18, 26, 43, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.10)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  onPrimary: '#FFFFFF',
  darkCard: '#0F172A',
  overlay: 'rgba(2, 6, 23, 0.72)',
  tabBar: 'rgba(15, 23, 42, 0.78)',
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
  tabBarHeight: 72,
  floatingTabInset: 12,
  floatingTabBottom: 18,
};
