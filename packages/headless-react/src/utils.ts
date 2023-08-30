export function capitalize(s: string) {
  return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

export type SingletonGetter<T> = {get(): T};

export function singleton<T>(valueGetter: () => T): SingletonGetter<T> {
  let currentValue: T;
  let gotValue = false;
  return {
    get() {
      if (gotValue) {
        return currentValue;
      }
      currentValue = valueGetter();
      gotValue = true;
      return currentValue;
    },
  };
}

// Duplicated from packages/headless/src/utils to keep headless exported API surface clean
// TODO: Explore using a third party lib such as https://www.npmjs.com/package/map-obj to remove duplication
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
