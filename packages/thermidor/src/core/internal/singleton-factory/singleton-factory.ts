/**
 * Creates a memoized function that computes a value once per unique key and
 * caches it for subsequent calls.
 *
 * @typeParam K - The cache key type used to index stored values.
 * @typeParam V - The type of the cached value.
 * @typeParam A - The argument type passed to the returned function. Defaults to `K`.
 *
 * @param factory - A function that produces a value from the given argument.
 *   Called at most once per unique key.
 * @param keyFn - An optional function that derives a cache key from the
 *   argument. Defaults to identity (i.e., the argument itself is used as the key).
 * @returns A function with signature `(arg: A) => V` that returns the cached
 *   value for the derived key, creating it via `factory` on first access.
 *
 * @example
 * // Simple case: argument is the key
 * const getOrCreateSlice = SingletonFactory(createSlice);
 * const slice = getOrCreateSlice('my-interface');
 *
 * @example
 * // Custom key derivation from a complex argument
 * const resolve = SingletonFactory<string, Thunk, Scope>(
 *   (scope) => createThunk(engine, scope),
 *   (scope) => scope.composedInterfaceId ?? scope.interfaceId,
 * );
 */
export function SingletonFactory<K, V, A = K>(
  factory: (arg: A) => V,
  keyFn: (arg: A) => K = (arg) => arg as unknown as K
): (arg: A) => V {
  const cache = new Map<K, V>();
  return (arg: A): V => {
    const key = keyFn(arg);
    if (!cache.has(key)) {
      cache.set(key, factory(arg));
    }
    return cache.get(key) as V;
  };
}
