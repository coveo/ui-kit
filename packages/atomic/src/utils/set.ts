// TODO: Replace by Set.prototype.intersection in July 2025
export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const elem of setA) {
    if (setB.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}
