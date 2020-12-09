import {CategoryFacetResponse, CategoryFacetValue} from './interfaces/response';
import {
  logFacetDeselect,
  logFacetSelect,
} from '../facet-set/facet-set-analytics-actions';

type CategoryFacetResponsePartition = {
  parents: CategoryFacetValue[];
  values: CategoryFacetValue[];
};

export function partitionIntoParentsAndValues(
  response: CategoryFacetResponse | undefined
): CategoryFacetResponsePartition {
  if (!response) {
    return {parents: [], values: []};
  }

  let parents: CategoryFacetValue[] = [];
  let values = response.values;

  while (values.length && values[0].children.length) {
    parents = [...parents, ...values];
    values = values[0].children;
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
  const payload = {
    facetId,
    facetValue: selection.value,
  };

  const isSelected = selection.state === 'selected';
  return isSelected ? logFacetDeselect(payload) : logFacetSelect(payload);
};
