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

  const activeLeafValue = values.find((v) => v.state !== 'idle');

  if (activeLeafValue) {
    parents = [...parents, activeLeafValue];
    values = [];
  }

  return {parents, values};
}
