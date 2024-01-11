import {createCustomEqual, deepEqual} from 'fast-equals';

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

export const deepEqualAnyOrder: <T>(a: T, b: T) => boolean = createCustomEqual({
  createCustomConfig: (config) => {
    return {
      ...config,
      areArraysEqual: arrayEqualAnyOrder,
    };
  },
});

/**
 * Checks if two arrays have the same elements, in different order.
 *
 * @param a The first array to compare.
 * @param b The second array to compare.
 * @returns `true` if the arrays have the same elements in different order, `false` otherwise. This function will return false if the 2 arrays have the same elements in the same order.
 * @template T The type of elements in the arrays.
 */
export const arrayEqualStrictlyDifferentOrder = <T>(
  a: T[],
  b: T[]
): boolean => {
  const set1 = [...new Set(a)];
  const set2 = [...new Set(b)];

  if (set1.length !== set2.length) {
    return false;
  }
  if (set1.length === 1) {
    return deepEqual(set1[0], set2[0]);
  }
  if (set1.every((value) => set2.includes(value))) {
    return !set1.every((value, idx) => set2.indexOf(value) === idx);
  }

  return false;
};
