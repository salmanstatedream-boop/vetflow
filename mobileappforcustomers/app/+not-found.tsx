import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Muted, PrimaryButton, Title } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { goReplace } from '@/lib/nav';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <View style={styles.container}>
        <Title>Page not found</Title>
        <Muted>That screen doesn’t exist in Phoenix Care.</Muted>
        <View style={{ height: 20 }} />
        <PrimaryButton label="Go home" onPress={() => goReplace('/')} />
        <Link href="/" style={styles.link}>
          <Muted>Or tap here</Muted>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
    gap: 8,
  },
  link: { marginTop: 12 },
});
