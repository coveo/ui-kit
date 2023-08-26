import {CategoryFacetValueRequest} from './interfaces/request';
import {CategoryFacetValue} from './interfaces/response';

type GenericCategoryFacetValue = CategoryFacetValueRequest | CategoryFacetValue;

type CategoryFacetValuePartition<T extends GenericCategoryFacetValue> = {
  parents: T[];
  values: T[];
};

export function partitionIntoParentsAndValues<
  T extends GenericCategoryFacetValue
>(nestedValues: T[] | undefined): CategoryFacetValuePartition<T> {
  if (!nestedValues) {
    return {parents: [], values: []};
  }

  let parents: T[] = [];
  let values = nestedValues;

  while (values.length && values[0].children.length) {
    parents = [...parents, ...values];
    values = values[0].children as T[];
  }

  const selectedLeafValue = values.find((v) => v.state === 'selected');

  if (selectedLeafValue) {
    parents = [...parents, selectedLeafValue];
    values = [];
  }

  return {parents, values};
}

export function findActiveValueAncestry<T extends GenericCategoryFacetValue>(
  valuesAsTree: T[]
): T[] {
  const ancestryMap = new Map<T, T>();
  const activeValue = getActiveValueFromValueTree(valuesAsTree, ancestryMap);
  return activeValue ? getActiveValueAncestry(activeValue, ancestryMap) : [];
}

function getActiveValueFromValueTree<TValue extends GenericCategoryFacetValue>(
  valuesAsTrees: TValue[],
  ancestryMap?: Map<TValue, TValue>
): TValue | undefined {
  const valueToVisit = [...valuesAsTrees];
  while (valueToVisit.length > 0) {
    const currentValue = valueToVisit.shift()!;
    if (currentValue.state === 'selected') {
      return currentValue;
    }
    if (ancestryMap) {
      for (const childValue of currentValue.children) {
        ancestryMap.set(childValue as TValue, currentValue);
      }
    }
    valueToVisit.unshift(...(currentValue.children as TValue[]));
  }
  return undefined;
}

function getActiveValueAncestry<TValue extends GenericCategoryFacetValue>(
  activeValue: TValue | undefined,
  valueToParentMap: Map<TValue, TValue>
): TValue[] {
  const activeValueAncestry: TValue[] = [];
  if (!activeValue) {
    return [];
  }
  let lastParent: TValue | undefined = activeValue;
  do {
    activeValueAncestry.unshift(lastParent);
    lastParent = valueToParentMap.get(lastParent);
  } while (lastParent);
  return activeValueAncestry;
}
