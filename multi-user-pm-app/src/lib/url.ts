export function extractParam(pathname: string, key: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf(key);
  if (index !== -1 && index + 1 < segments.length) {
    return segments[index + 1];
  }
  return null;
}
