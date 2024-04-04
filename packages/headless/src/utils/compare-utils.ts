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
