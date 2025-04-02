export type BrowserStorage = Pick<
  Storage,
  'setItem' | 'getItem' | 'removeItem'
>;

export function getBrowserStorage(): BrowserStorage {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
}
