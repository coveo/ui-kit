/**
 * Computes the symmetric difference between two sets.
 * The symmetric difference of two sets is the set of elements
 * which are in either of the sets and not in their intersection.
 *
 * @template T - The type of elements in the sets.
 * @param {Set<T>} setA - The first set.
 * @param {Set<T>} setB - The second set.
 * @returns {Set<T>} A new set containing the symmetric difference of setA and setB.
 */
export function symmetricDifference<T>(setA: Set<T>, setB: Set<T>) {
  const result = new Set<T>();

  // Add elements from setA that are not in setB
  for (const elem of setA) {
    if (!setB.has(elem)) {
      result.add(elem);
    }
  }

  // Add elements from setB that are not in setA
  for (const elem of setB) {
    if (!setA.has(elem)) {
      result.add(elem);
    }
  }

  return result;
}

/**
 * Computes the difference between two sets.
 * The difference of two sets is the set of elements that are in the first set
 * but not in the second set.
 *
 * @template T - The type of elements in the sets.
 * @param {Set<T>} setA - The first set.
 * @param {Set<T>} setB - The second set.
 * @returns {Set<T>} A new set containing the difference of setA and setB.
 */
export function difference<T>(setA: Set<T>, setB: Set<T>) {
  const result = new Set<T>();

  // Add elements from setA that are not in setB
  for (const elem of setA) {
    if (!setB.has(elem)) {
      result.add(elem);
    }
  }

  return result;
}
