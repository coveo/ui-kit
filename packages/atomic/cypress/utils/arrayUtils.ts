export function toArray<T>(values: T | T[]): T[] {
  return Array.isArray(values) ? values : [values];
}
