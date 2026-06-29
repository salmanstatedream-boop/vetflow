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

function parseHrefQuery(href: string): URLSearchParams {
  const q = href.includes('?') ? href.split('?')[1]! : '';
  return new URLSearchParams(q);
}

function getSearchParam(
  params: URLSearchParams | Record<string, string>,
  key: string
): string | null {
  if (params instanceof URLSearchParams) return params.get(key);
  return params[key] ?? null;
}

/** True when pathname and relevant query params match (for same-route nav). */
export function hrefsMatchCurrent(
  targetHref: string,
  currentPathname: string,
  currentSearchParams: URLSearchParams | Record<string, string>
): boolean {
  const pathOnly = targetHref.split('?')[0] ?? targetHref;
  if (!routePathsMatch(pathOnly, currentPathname)) return false;

  const targetQuery = parseHrefQuery(targetHref);
  if ([...targetQuery.keys()].length === 0) {
    return getSearchParam(currentSearchParams, 'tab') !== 'intake';
  }

  const currentParams =
    currentSearchParams instanceof URLSearchParams
      ? currentSearchParams
      : new URLSearchParams(currentSearchParams);

  for (const [key, expected] of targetQuery.entries()) {
    if (currentParams.get(key) !== expected) return false;
  }
  return true;
}
