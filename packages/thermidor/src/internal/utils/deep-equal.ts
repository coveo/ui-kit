/**
 * Recursively compares two values for structural equality, independent of
 * property insertion order. Optionally excludes specified keys from comparison.
 */
export function deepEqual(a: unknown, b: unknown, options?: {excludeKeys?: string[]}): boolean {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i], options));
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    if (Array.isArray(a) !== Array.isArray(b)) {
      return false;
    }
    const excludeKeys = options?.excludeKeys ?? [];
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA).filter((k) => !excludeKeys.includes(k));
    const keysB = Object.keys(objB).filter((k) => !excludeKeys.includes(k));
    if (keysA.length !== keysB.length) {
      return false;
    }
    return keysA.every((key) => key in objB && deepEqual(objA[key], objB[key], options));
  }
  return false;
}
