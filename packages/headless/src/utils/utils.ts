export const randomID = (prepend?: string, length = 5) =>
  prepend +
  Math.random()
    .toString(36)
    .substr(2, 2 + length);

export function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

export function flatten<T>(values: T[][]): T[] {
  const flattenedValues: T[] = [];
  values.forEach((v) => flattenedValues.push(...v));
  return flattenedValues;
}
