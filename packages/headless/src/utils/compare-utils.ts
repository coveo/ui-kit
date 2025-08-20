import type {PrimitivesValues} from '@coveo/bueno';
import {createCustomEqual} from 'fast-equals';

export function arrayEqual<T>(
  firstArray: T[],
  secondArray: T[],
  isEqual: (first: T, second: T) => boolean = (first, second) =>
    first === second
) {
  return (
    firstArray.length === secondArray.length &&
    firstArray.findIndex((val, i) => !isEqual(secondArray[i], val)) === -1
  );
}
function checkUnionEquality<T extends PrimitivesValues>(
  set1: Set<T>,
  set2: Set<T>
): boolean {
  const unionSet = new Set([...set1, ...set2]);
  return unionSet.size === set1.size && unionSet.size === set2.size;
}

/**
 * Checks if two arrays are equal regardless of the order of their elements.
 *
 * @param firstArray - The first array to compare.
 * @param secondArray - The second array to compare.
 * @returns `true` if the arrays have the same elements regardless of their order, `false` otherwise.
 */
function arrayEqualAnyOrder<T>(firstArray: T[], secondArray: T[]) {
  if (firstArray.length !== secondArray.length) {
    return false;
  }

  return firstArray.every(
    (firstVal) =>
      secondArray.findIndex((secondVal) =>
        deepEqualAnyOrder(firstVal, secondVal)
      ) !== -1
  );
}

/**
 * Checks if two arrays of primitive values have the same elements, in different order.
 * This function is specifically designed for primitive values to ensure fast performance with O(n) complexity.
 *
 * @param firstArray The first array of primitive values to compare.
 * @param secondArray The second array of primitive values to compare.
 * @returns `true` if the arrays have the same elements in different orders, `false` otherwise. Unless the two arrays have only one identical element each, this function will return `false` if the two arrays have the same elements in the same order.
 */
export const arrayEqualStrictlyDifferentOrder = <
  T extends Exclude<PrimitivesValues, object>,
>(
  firstArray: T[],
  secondArray: T[]
): boolean => {
  const set1 = new Set(firstArray);
  const set2 = new Set(secondArray);

  if (set1.size !== set2.size) {
    return false;
  }
  if (set1.size === 1) {
    return firstArray[0] === secondArray[0];
  }
  if (checkUnionEquality(set1, set2)) {
    const arr1 = [...set1];
    const arr2 = [...set2];
    return !arr1.every((value, idx) => arr2[idx] === value);
  }

  return false;
};

export const deepEqualAnyOrder: <T>(a: T, b: T) => boolean = createCustomEqual({
  createCustomConfig: (config: {}) => {
    return {
      ...config,
      areArraysEqual: arrayEqualAnyOrder,
    };
  },
});
