export function readFromObject<T extends object>(
  object: T,
  key: string
): string | undefined {
  const keys = key.split('.');
  let current: unknown = object;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}
