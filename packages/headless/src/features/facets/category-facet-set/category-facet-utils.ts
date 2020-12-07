import {CategoryFacetValueRequest} from './interfaces/request';
import {CategoryFacetValue} from './interfaces/response';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../facet-set/facet-set-analytics-actions';
import {FacetSelectionChangeMetadata} from '../facet-set/facet-set-analytics-actions-utils';

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

export const getAnalyticsActionForCategoryFacetToggleSelect = (
  facetId: string,
  selection: CategoryFacetValue
) => {
  const payload: FacetSelectionChangeMetadata = {
    facetId,
    facetValue: selection.value,
  };

  const isSelected = selection.state === 'selected';
  return isSelected ? logFacetDeselect(payload) : logFacetSelect(payload);
};
