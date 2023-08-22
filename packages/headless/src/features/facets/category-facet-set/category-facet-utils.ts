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

export function getActiveValueFromValueTree(
  valuesAsTrees: CategoryFacetValue[]
): CategoryFacetValue | undefined {
  const valueToVisit = [...valuesAsTrees];
  while (valueToVisit.length > 0) {
    const currentValue = valueToVisit.pop()!;
    if (currentValue.state === 'selected') {
      return currentValue;
    }
    valueToVisit.push(...currentValue.children);
  }
  return undefined;
}
