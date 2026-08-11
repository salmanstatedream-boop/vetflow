import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="pet/[id]"
        options={{ title: 'Pet profile', presentation: 'card' }}
      />
      <Stack.Screen name="care/[id]" options={{ title: 'Medications & vaccines' }} />
      <Stack.Screen name="chat/[threadId]" options={{ title: 'Clinic chat' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', headerShown: false }} />
    </Stack>
  );
}
