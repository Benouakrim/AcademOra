const paths = new Set<string>();
const visited = new Set<string>();

export function registerRoutePath(path: string | undefined) {
  if (!path) return;
  try { paths.add(path); } catch {}
}

export function getRegisteredRoutePaths(): string[] {
  return Array.from(paths).sort();
}

export function trackRoutePath<T extends string | undefined>(path: T): T {
  registerRoutePath(path as any);
  return path;
}

export function registerVisitedPath(pathname: string | undefined) {
  if (!pathname) return;
  try { visited.add(pathname); } catch {}
}

export function getVisitedPaths(): string[] {
  return Array.from(visited).sort();
}


