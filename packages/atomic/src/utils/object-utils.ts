export function readFromObject<T extends object>(
  object: T,
  key: string
): string | undefined {
  const keys = key.split('.');
  let current: unknown = object;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
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
