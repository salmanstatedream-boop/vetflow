import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memory = new Map<string, string>();

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export const storage = {
  getOnboardingDone: async () => (await getItem('pc_onboarding_done')) === '1',
  setOnboardingDone: async () => setItem('pc_onboarding_done', '1'),
  getSplashSeenSession: async () => (await getItem('pc_splash_boot')) === '1',
  getPendingInvite: async () => getItem('pc_pending_invite'),
  setPendingInvite: async (token: string) => setItem('pc_pending_invite', token),
  clearPendingInvite: async () => setItem('pc_pending_invite', ''),
};

let splashShownThisBoot = false;
export function consumeBootSplash() {
  if (splashShownThisBoot) return false;
  splashShownThisBoot = true;
  return true;
}
