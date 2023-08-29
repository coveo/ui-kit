import type {CategoryFacet, CategoryFacetValue} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {FocusTargetController} from '../../../../../utils/accessibility-utils';

export interface CategoryFacetValueRendererProps {
  facet: CategoryFacet;
  facetValues: CategoryFacetValue[];
  resultIndexToFocusOnShowMore: number;
  field: string;
  i18n: i18n;
  facetSearchQuery: string;
  focusTargets: {
    activeValueFocus: FocusTargetController;
    showLessFocus: FocusTargetController;
    showMoreFocus: FocusTargetController;
  };
}

export const getOnClickForUnselectedValue =
  (
    facet: CategoryFacet,
    value: CategoryFacetValue,
    activeValueFocusTarget: FocusTargetController
  ) =>
  (): void => {
    activeValueFocusTarget.focusAfterSearch();
    facet.toggleSelect(value);
  };

export const getIsLeafOrNodePart = (value: CategoryFacetValue) =>
  value.isLeafValue ? 'leaf-value' : 'node-value';

export const isValueSelected = (value: CategoryFacetValue) =>
  value.state === 'selected';
