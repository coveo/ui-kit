import type {CategoryFacetValue} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {getFieldValueCaption} from '../../../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../../common/facets/facet-value-link/facet-value-link';
import {
  CategoryFacetValueRendererProps,
  getIsLeafOrNodePart,
  getOnClickForUnselectedValue,
  isValueSelected,
} from './commons';

export const FlatCategoryFacet: FunctionalComponent<
  CategoryFacetValueRendererProps
> = ({
  focusTargets,
  facet,
  facetSearchQuery,
  facetValues,
  field,
  i18n,
  resultIndexToFocusOnShowMore,
}: CategoryFacetValueRendererProps) => {
  const renderChild = function (
    facetValue: CategoryFacetValue,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(field, facetValue.value, i18n);
    const isSelected = isValueSelected(facetValue);

    return (
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={i18n}
        onClick={getOnClickForUnselectedValue(
          facet,
          facetValue,
          focusTargets.activeValueFocus
        )}
        searchQuery={facetSearchQuery}
        buttonRef={(element) => {
          isShowLessFocusTarget &&
            focusTargets.showLessFocus.setTarget(element);
          isShowMoreFocusTarget &&
            focusTargets.showMoreFocus.setTarget(element);
        }}
        additionalPart={getIsLeafOrNodePart(facetValue)}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  };

  return (
    <ul part="values" class="mt-3">
      {facetValues.map((value, i) =>
        renderChild(value, i === 0, i === resultIndexToFocusOnShowMore)
      )}
    </ul>
  );
};
