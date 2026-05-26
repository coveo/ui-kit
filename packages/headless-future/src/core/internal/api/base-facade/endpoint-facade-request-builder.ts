import {RequestContributor} from './endpoint-facade-types.js';

export const buildRequest = <TRequest extends object>(
  contributors: Array<RequestContributor<TRequest>>
): TRequest => {
  return contributors.reduce<TRequest>((request, contribute) => {
    const fragment = contribute();
    return deepMerge(request, fragment);
  }, {} as TRequest);
};

const deepMerge = <T extends object>(base: T, patch: Partial<T>): T => {
  const result: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };

  for (const [key, incomingValue] of Object.entries(patch)) {
    const currentValue = result[key];

    if (isMergeableObject(currentValue) && isMergeableObject(incomingValue)) {
      result[key] = deepMerge(currentValue, incomingValue);
      continue;
    }

    result[key] = incomingValue;
  }

  return result as T;
};

const isMergeableObject = (
  value: unknown
): value is Record<string, unknown> => {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
};
