export function toArray<T>(values: T | T[]): T[] {
  return Array.isArray(values) ? values : [values];
}

export function findLast<T>(values: T[], predicate: (value: T) => boolean) {
  for (let i = values.length - 1; i >= 0; i--) {
    if (predicate(values[i])) {
      return values[i];
    }
  }
  return null;
}
