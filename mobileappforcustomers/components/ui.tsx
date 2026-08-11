import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Fonts, Radii, Spacing } from '@/constants/theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.92 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.textMuted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.9 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.onPrimary} />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  danger,
  disabled,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryBtn,
        danger && { borderColor: Colors.dangerSoft, backgroundColor: Colors.dangerSoft },
        (disabled || pressed) && { opacity: disabled ? 0.5 : 0.85 },
      ]}
    >
      <Text style={[styles.secondaryBtnText, danger && { color: Colors.danger }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = 'primary',
}: {
  label: string;
  tone?: 'primary' | 'success' | 'muted' | 'danger';
}) {
  const bg =
    tone === 'success'
      ? Colors.successSoft
      : tone === 'danger'
        ? Colors.dangerSoft
        : tone === 'muted'
          ? Colors.surfaceMuted
          : Colors.primarySoft;
  const color =
    tone === 'success'
      ? Colors.success
      : tone === 'danger'
        ? Colors.danger
        : tone === 'muted'
          ? Colors.textMuted
          : Colors.primaryDark;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.muted}>{body}</Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 12, alignSelf: 'stretch' }}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorBannerText}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={styles.errorRetry}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Skeleton({
  height = 16,
  width = '100%',
  radius = Radii.sm,
  style,
}: {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: Colors.surfaceMuted,
        },
        style,
      ]}
    />
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.screenHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  meta,
  onPress,
  right,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const content = (
    <>
      <View style={{ flex: 1, gap: 2 }}>
        {meta ? <Text style={styles.listMeta}>{meta}</Text> : null}
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {right ?? (
        <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
      )}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.9 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.listRow}>{content}</View>;
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QuickActionTile({
  icon,
  label,
  onPress,
  danger,
  stub,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
  stub?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickTile,
        danger && { backgroundColor: Colors.dangerSoft },
        pressed && { opacity: 0.88 },
      ]}
    >
      <FontAwesome
        name={icon}
        size={20}
        color={danger ? Colors.danger : Colors.primary}
      />
      <Text style={[styles.quickLabel, danger && { color: Colors.danger }]} numberOfLines={2}>
        {label}
      </Text>
      {stub ? <Text style={styles.soon}>Soon</Text> : null}
    </Pressable>
  );
}

export function GradientPetHero({
  name,
  breed,
  meta,
  nextCare,
  clinic,
}: {
  name: string;
  breed?: string | null;
  meta: string;
  nextCare?: string | null;
  clinic?: string | null;
}) {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroRow}>
        <View style={styles.heroAvatar}>
          <FontAwesome name="paw" size={28} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          {clinic ? <Text style={styles.heroClinic}>{clinic}</Text> : null}
          <Text style={styles.heroName}>{name}</Text>
          {breed ? <Text style={styles.heroBreed}>{breed}</Text> : null}
          <Text style={styles.heroMeta}>{meta}</Text>
        </View>
      </View>
      {nextCare ? (
        <View style={styles.nextCare}>
          <Text style={styles.nextCareLabel}>Next care</Text>
          <Text style={styles.nextCareValue}>{nextCare}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

export function TimelineCard({
  date,
  status,
  title,
  subtitle,
  note,
}: {
  date: string;
  status: string;
  title: string;
  subtitle?: string;
  note?: string;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>
      <Card style={{ flex: 1, marginBottom: 10 }}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineDate}>{date}</Text>
          <Badge label={status} />
        </View>
        <Text style={styles.timelineTitle}>{title}</Text>
        {subtitle ? <Muted>{subtitle}</Muted> : null}
        {note ? <Muted>{note}</Muted> : null}
      </Card>
    </View>
  );
}

export function Stepper({
  steps,
  activeIndex,
}: {
  steps: { title: string; subtitle?: string }[];
  activeIndex: number;
}) {
  return (
    <View style={{ gap: 14 }}>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <View key={step.title} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                done && { backgroundColor: Colors.success },
                active && { backgroundColor: Colors.primary },
              ]}
            >
              {done ? (
                <FontAwesome name="check" size={12} color="#fff" />
              ) : (
                <Text style={styles.stepNum}>{i + 1}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, !done && !active && { color: Colors.textMuted }]}>
                {step.title}
              </Text>
              {step.subtitle ? <Muted>{step.subtitle}</Muted> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <Card>
      <EmptyState
        title={`${feature} coming soon`}
        body="This feature is planned for a later Phoenix Care release. Core care tools are available now."
      />
    </Card>
  );
}

export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>{children}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryBtnText: {
    color: Colors.onPrimary,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  secondaryBtn: {
    minHeight: 50,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    color: Colors.text,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    textTransform: 'capitalize',
  },
  empty: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dangerSoft,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.danger,
    lineHeight: 18,
  },
  errorRetry: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.danger,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  screenHeaderTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listMeta: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.md,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: {
    color: Colors.textMuted,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  segmentTextActive: { color: Colors.text, fontFamily: Fonts.bold },
  quickTile: {
    width: '31%',
    minWidth: 96,
    aspectRatio: 1,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    textAlign: 'center',
  },
  soon: {
    fontSize: 9,
    color: Colors.textMuted,
    fontFamily: Fonts.bold,
  },
  hero: {
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: Radii.md,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroClinic: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  heroName: { color: '#fff', fontSize: 22, fontFamily: Fonts.extraBold },
  heroBreed: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.regular,
  },
  nextCare: {
    marginTop: 14,
    backgroundColor: 'rgba(15,23,42,0.28)',
    borderRadius: Radii.md,
    padding: 12,
  },
  nextCareLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  nextCareValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginTop: 2,
  },
  timelineRow: { flexDirection: 'row', gap: 10 },
  timelineRail: { width: 16, alignItems: 'center' },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 18,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  timelineDate: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  timelineTitle: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 12, fontFamily: Fonts.bold, color: Colors.textMuted },
  stepTitle: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.text },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
});
