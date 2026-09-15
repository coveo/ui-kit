/**
 * Reads the ordered child ids a container renderer must mount, from the resolved
 * A2-UI props.
 *
 * Composition lives on the A2-UI plane: the node's `children` array is flattened onto
 * the resolved props by the Surface_Bridge, so it is present at runtime even though the
 * generated `*Props` types (the AG-UI-facing prop contract) do not declare it. It is read
 * defensively here so an unavailable or malformed composition yields an empty ordered list
 * rather than an error: a non-array `children` (or its absence) degrades to `[]`, and any
 * non-string entry is dropped while preserving the order of the remaining ids.
 */
export function readChildIds(props: object): string[] {
  const children = (props as {children?: unknown}).children;
  if (!Array.isArray(children)) {
    return [];
  }
  return children.filter((id): id is string => typeof id === 'string');
}
