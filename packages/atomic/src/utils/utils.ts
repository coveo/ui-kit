/**
 * Returns a function that can be executed only once
 */
export function once<T extends unknown[], R>(fn: (...args: T) => R) {
  let result: R;
  let callable: ((...args: T) => R) | null = fn;
  return function (this: unknown, ...args: T) {
    if (callable) {
      result = callable.apply(this, args);
      callable = null; // Allow garbage collection
    }
    return result;
  };
}

export async function defer() {
  return new Promise<void>((resolve) => setTimeout(resolve, 10));
}
