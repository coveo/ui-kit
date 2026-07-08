/**
 * Creates a selector that reads a scoped slice from the flat-keyed state.
 * Falls back to the provided `initialState` when the slice has not been adopted.
 */
export function createSelectSlice<T>(
  interfaceId: string,
  featureName: string,
  initialState: T
): (state: Record<string, unknown>) => T {
  const key = `${interfaceId}/${featureName}`;

  return (state: Record<string, unknown>): T => {
    const slice = state[key];
    return slice === undefined ? initialState : (slice as T);
  };
}
