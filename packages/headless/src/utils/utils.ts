export const randomID = (prepend?: string, length = 5) =>
  prepend +
  Math.random()
    .toString(36)
    .substr(2, 2 + length);

export function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

export function isEmptyString(str: string) {
  return str.trim() === '';
}

export function removeDuplicates<T>(
  arr: T[],
  getIdentifier: (value: T, index: number) => string
) {
  return Object.values(
    arr.reduce(
      (existingValues, value, index) => ({
        ...existingValues,
        [getIdentifier(value, index)]: value,
      }),
      <Record<string, T>>{}
    )
  );
}
