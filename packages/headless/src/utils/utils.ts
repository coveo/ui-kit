import {Middleware, Action} from '@reduxjs/toolkit';

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

export function removeDuplicates<T>(arr: T[], predicate: (value: T) => string) {
  return [
    ...arr
      .reduce((map, item) => {
        const key = predicate(item);

        map.has(key) || map.set(key, item);

        return map;
      }, new Map())
      .values(),
  ];
}

export function encodedBtoa(stringToEncode: string) {
  return btoa(encodeURI(stringToEncode))!;
}

export function omit<T>(key: keyof T, obj: T) {
  const {[key]: omitted, ...rest} = obj;
  return rest;
}

export function getObjectHash<T>(obj: T) {
  return encodedBtoa(JSON.stringify(obj));
}

const doNotTrackValues = new Set(['1', 1, 'yes', true]);
// TODO KIT-2844

/**
 * Logic copied from coveo.analytics.
 *
 * @deprecated V4 - Starting with Event Protocol, Coveo will no longer respect the DNT standard.
 * Instead, we will provide implementers with documentation on privacy best-practices, letting
 * them decide which standards to respect.
 * For more context behind the decision, see: https://coveord.atlassian.net/browse/LENS-1502
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

export function mapObject<TKey extends string, TInitialValue, TNewValue>(
  obj: Record<TKey, TInitialValue>,
  predicate: (value: TInitialValue, key: TKey) => TNewValue
): Record<TKey, TNewValue> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      predicate(value as TInitialValue, key as TKey),
    ])
  ) as Record<TKey, TNewValue>;
}

export function filterObject<TKey extends string, TValue>(
  obj: Record<TKey, TValue>,
  predicate: (value: TValue, key: TKey) => boolean
): Record<TKey, TValue> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) =>
      predicate(value as TValue, key as TKey)
    )
  ) as Record<TKey, TValue>;
}

// TODO: Could eventually be replaced with `structuredClone`.
// However, this is not compatible with salesforce locker service.
export function clone<T>(value: T): T {
  if (typeof value !== 'object') {
    return value;
  }
  if (!value) {
    return value;
  }
  // JSON parse/stringify can fail in some cases (ie: recursive objects)
  // add defensive code to prevent the whole app from crashing
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return value;
  }
}

function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
} {
  let resolve: null | ((value: T) => void) = null;
  let reject: null | ((error: unknown) => void) = null;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {promise, resolve: resolve!, reject: reject!};
}

export function createWaitForActionMiddleware<TAction extends Action>(
  isDesiredAction: (action: unknown) => action is TAction
): {promise: Promise<TAction>; middleware: Middleware} {
  const {promise, resolve} = createDeferredPromise<TAction>();

  const middleware: Middleware = () => (next) => (action) => {
    next(action);
    if (isDesiredAction(action)) {
      resolve(action);
    }
  };

  return {promise, middleware};
}
