/**
 * Returns a function that can be executed only once
 */
export function once<T extends unknown[], R>(fn: (...args: T) => R) {
  let result: R;
  let callable: ((...args: T) => R) | null = fn;
  return function (this: unknown, ...args: T) {
    if (callable) {
      result = callable.apply(this, args);
      callable = null; // Allow garbage collection
    }
    return result;
  };
}

export function isPropValuesEqual<ObjectWithProperties extends object>(
  subject: ObjectWithProperties,
  target: ObjectWithProperties,
  propNames: (keyof ObjectWithProperties)[]
) {
  return propNames.every((propName) => subject[propName] === target[propName]);
}

export function aggregate<V, K extends PropertyKey>(
  values: readonly V[],
  getKey: (value: V, index: number) => K
): Record<K, V[] | undefined> {
  return values.reduce(
    (aggregatedValues, value, i) => {
      const key = getKey(value, i);
      if (!(key in aggregatedValues)) {
        aggregatedValues[key] = [];
      }
      aggregatedValues[key]!.push(value);
      return aggregatedValues;
    },
    <Record<K, V[] | undefined>>{}
  );
}

/**
 * Similar as a classic spread, but preserve all characteristics of properties (e.g. getter/setter).
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#description
 * for an explanation why (spread & assign work similarly).
 * @param objects the objects to "spread" together
 * @returns the spread result
 */
export function spreadProperties<Output extends object = {}>(
  ...objects: object[]
) {
  const returnObject = {};
  for (const obj of objects) {
    Object.defineProperties(
      returnObject,
      Object.getOwnPropertyDescriptors(obj)
    );
  }
  return returnObject as Output;
}

export async function defer() {
  return new Promise<void>((resolve) => setTimeout(resolve, 10));
}
