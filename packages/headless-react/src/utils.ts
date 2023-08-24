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
