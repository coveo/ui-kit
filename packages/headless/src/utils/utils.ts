export const randomID = (prepend?: string, length = 5) =>
  prepend +
  Math.random()
    .toString(36)
    .substr(2, 2 + length);

export function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

export function arrayEquals<T>(firstArray: T[], secondArray: T[]) {
  return (
    firstArray.length === secondArray.length &&
    firstArray.findIndex((val, i) => secondArray[i] !== val) === -1
  );
}
