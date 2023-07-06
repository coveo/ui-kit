import {btoa as btoashim} from 'abab';

export const randomID = (prepend?: string, length = 5) =>
  prepend +
  Math.random()
    .toString(36)
    .substring(2, 2 + length);

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

export function encodedBtoa(stringToEncode: string) {
  return (typeof btoa !== 'undefined' ? btoa : btoashim)(
    encodeURI(stringToEncode)
  )!;
}

export function omit<T>(key: keyof T, obj: T) {
  const {[key]: omitted, ...rest} = obj;
  return rest;
}

export function getObjectHash<T>(obj: T) {
  return encodedBtoa(JSON.stringify(obj));
}

const doNotTrackValues = new Set(['1', 1, 'yes', true]);

/**
 * Logic copied from coveo.analytics.
 */
export function doNotTrack() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = <any>navigator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = <any>window;
  return [
    nav.globalPrivacyControl,
    nav.doNotTrack,
    nav.msDoNotTrack,
    win.doNotTrack,
  ].some((value) => doNotTrackValues.has(value));
}

export function fromEntries<K extends PropertyKey, V>(
  values: [K, V][]
): Record<K, V> {
  const newObject: Partial<Record<K, V>> = {};
  for (const [key, value] of values) {
    newObject[key] = value;
  }
  return newObject as Record<K, V>;
}

export function resetTimeout(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any[]) => void,
  timeoutId?: ReturnType<typeof setTimeout>,
  ms?: number | undefined
) {
  clearTimeout(timeoutId);
  return setTimeout(callback, ms);
}
