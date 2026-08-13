import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Layout, Radii } from '@/constants/theme';

type TabIcon = React.ComponentProps<typeof FontAwesome>['name'];

const TAB_META: Record<string, { label: string; icon: TabIcon }> = {
  index: { label: 'Home', icon: 'home' },
  pets: { label: 'Pets', icon: 'paw' },
  visits: { label: 'Visits', icon: 'calendar' },
  messages: { label: 'Messages', icon: 'comments' },
  more: { label: 'More', icon: 'ellipsis-h' },
};

export function FloatingTabBar(props: any) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const visible = state.routes.filter((r: { key: string; name: string }) => {
    const opts = descriptors[r.key]?.options;
    return opts?.href !== null && TAB_META[r.name];
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, 10) + Layout.floatingTabBottom - 10 },
      ]}
    >
      <View style={styles.pillShadow}>
        <BlurView intensity={65} tint="dark" style={styles.pill}>
          {visible.map((route: { key: string; name: string }) => {
            const routeIndex = state.routes.findIndex(
              (r: { key: string }) => r.key === route.key
            );
            const focused = state.index === routeIndex;
            const meta = TAB_META[route.name];
            const badge = descriptors[route.key]?.options?.tabBarBadge;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  focused && styles.itemActive,
                  pressed && !focused && { opacity: 0.75 },
                  pressed && focused && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <View>
                  <FontAwesome
                    name={meta.icon}
                    size={18}
                    color={focused ? Colors.onPrimary : Colors.textMuted}
                  />
                  {badge != null && badge !== '' ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {typeof badge === 'number' && badge > 9 ? '9+' : String(badge)}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[styles.label, focused && styles.labelActive]}
                  numberOfLines={1}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Layout.floatingTabInset,
    right: Layout.floatingTabInset,
    bottom: 0,
  },
  pillShadow: {
    borderRadius: Radii.full,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.tabBar,
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: Layout.tabBarHeight - 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  itemActive: {
    backgroundColor: Colors.primaryDark,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.onPrimary,
    fontFamily: Fonts.semiBold,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: Fonts.bold },
});
