/**
 * Returns a function that can be executed only once
 */
export function once<T extends unknown[]>(fn: (...args: T) => unknown) {
  let result: unknown;
  return function (this: unknown, ...args: T) {
    if (fn) {
      result = fn.apply(this, args);
      fn = () => {};
    }
    return result;
  };
}
