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

export function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === undefined || value === null;
}

export function mapOrExclude<T, U>(
  array: T[],
  predicate: (value: T, index: number) => U | undefined | null
): U[] {
  const values: U[] = [];
  array.forEach((value, index) => {
    const newValue = predicate(value, index);
    if (!isNullOrUndefined(newValue)) {
      values.push(newValue);
    }
  });
  return values;
}
