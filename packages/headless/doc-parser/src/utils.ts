export function inverseTypeGuard<T, A extends T>(
  predicate: (obj: T) => obj is A
) {
  return ((obj: T) => !predicate(obj)) as <B extends T>(obj: A | B) => obj is B;
}
