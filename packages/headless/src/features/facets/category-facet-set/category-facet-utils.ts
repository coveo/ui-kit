import {CommerceCategoryFacetValueRequest} from '../../commerce/facets/category-facet-set/interfaces/request';
import {CategoryFacetValueCommon} from './interfaces/commons';
import {CategoryFacetValueRequest} from './interfaces/request';
import {CategoryFacetValue} from './interfaces/response';

type GenericCategoryFacetValue = CategoryFacetValueRequest | CategoryFacetValue;

type CategoryFacetValuePartition<T extends GenericCategoryFacetValue> = {
  parents: T[];
  values: T[];
};

export function partitionIntoParentsAndValues<
  T extends GenericCategoryFacetValue,
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

export function findActiveValueAncestry(
  valuesAsTress: CategoryFacetValueRequest[]
): CategoryFacetValueRequest[];
export function findActiveValueAncestry(
  valuesAsTress: CategoryFacetValue[]
): CategoryFacetValue[];
export function findActiveValueAncestry(
  valuesAsTree: CategoryFacetValueCommon[]
): CategoryFacetValueCommon[];
export function findActiveValueAncestry(
  valuesAsTree: CommerceCategoryFacetValueRequest[]
): CommerceCategoryFacetValueRequest[] {
  const {activeValue, ancestryMap} =
    getActiveValueAndAncestryFromValueTree(valuesAsTree);
  return activeValue ? getActiveValueAncestry(activeValue, ancestryMap) : [];
}

function getActiveValueAndAncestryFromValueTree(
  valuesAsTrees: CategoryFacetValueCommon[]
) {
  const valueToVisit: CategoryFacetValueCommon[] = [...valuesAsTrees];
  const ancestryMap = new Map<
    CategoryFacetValueCommon,
    CategoryFacetValueCommon
  >();
  while (valueToVisit.length > 0) {
    const currentValue: CategoryFacetValueCommon = valueToVisit.shift()!;
    if (currentValue.state === 'selected') {
      return {activeValue: currentValue, ancestryMap};
    }
    if (ancestryMap) {
      for (const childValue of currentValue.children) {
        ancestryMap.set(childValue, currentValue);
      }
    }
    valueToVisit.unshift(...currentValue.children);
  }
  return {};
}

function getActiveValueAncestry(
  activeValue: CategoryFacetValueCommon | undefined,
  valueToParentMap: Map<CategoryFacetValueCommon, CategoryFacetValueCommon>
): CategoryFacetValueCommon[] {
  const activeValueAncestry: CategoryFacetValueCommon[] = [];
  if (!activeValue) {
    return [];
  }
  let lastParent: CategoryFacetValueCommon | undefined = activeValue;
  do {
    activeValueAncestry.unshift(lastParent);
    lastParent = valueToParentMap.get(lastParent);
  } while (lastParent);
  return activeValueAncestry;
}
