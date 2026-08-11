import { type Href, router } from 'expo-router';

/** Bypass stale typed-routes until Expo regenerates `expo-env.d.ts`. */
export function go(path: string) {
  router.push(path as Href);
}

export function goReplace(path: string) {
  router.replace(path as Href);
}
