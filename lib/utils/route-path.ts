/** Normalize a route path for same-route comparisons (strip query, trailing slash). */
export function normalizeRoutePath(path: string): string {
  const withoutQuery = path.split('?')[0] ?? path;
  const normalized = withoutQuery.replace(/\/$/, '') || '/';
  return normalized;
}

/** True when two routes refer to the same page (exact match). */
export function routePathsMatch(a: string, b: string): boolean {
  return normalizeRoutePath(a) === normalizeRoutePath(b);
}
