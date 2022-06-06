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

export const deepEqualAnyOrder = createCustomEqual(
  (deepEqual) => (firstObject, secondObject) => {
    if (Array.isArray(firstObject) && Array.isArray(secondObject)) {
      if (firstObject.length !== secondObject.length) {
        return false;
      }

      return firstObject.every(
        (firstVal) =>
          secondObject.findIndex((secondVal) =>
            deepEqual(firstVal, secondVal)
          ) !== -1
      );
    }

    return deepEqual(firstObject, secondObject);
  }
);
