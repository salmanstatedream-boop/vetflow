import { Stack } from 'expo-router';
import { Colors, Fonts } from '@/constants/theme';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.backgroundElevated },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontFamily: Fonts.semiBold },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="pet/[id]"
        options={{ title: 'Pet profile', presentation: 'card' }}
      />
      <Stack.Screen name="care/[id]" options={{ title: 'Medical record' }} />
      <Stack.Screen name="graphs/[petId]" options={{ title: 'Graphs' }} />
      <Stack.Screen name="surgery/[petId]" options={{ title: 'Surgery' }} />
      <Stack.Screen name="chat/[threadId]" options={{ title: 'Clinic chat' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', headerShown: false }} />
    </Stack>
  );
}
