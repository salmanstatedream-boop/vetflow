import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

/** Booking lives on Visits — this route redirects to keep one polished flow. */
export default function BookScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace({ pathname: '/(owner)/(tabs)/visits', params: { book: '1' } });
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});
