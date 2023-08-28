import type {CategoryFacet, CategoryFacetValue} from '@coveo/headless';
import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {FocusTargetController} from '../../../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../../../utils/field-utils';
import {FacetValueLabelHighlight} from '../../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../../common/facets/facet-value-link/facet-value-link';
import {getOnClickForUnselectedValue} from './commons';

interface FlatCategoryFacetProps {
  facet: CategoryFacet;
  facetValues: CategoryFacetValue[];
  resultIndexToFocusOnShowMore: number;
  field: string;
  i18n: i18n;
  facetSearchQuery: string;
  focusTargets: {
    activeValue: FocusTargetController;
    showLessFocus: FocusTargetController;
    showMoreFocus: FocusTargetController;
  };
}

export const FlatCategoryFacet: FunctionalComponent<FlatCategoryFacetProps> = ({
  focusTargets,
  facet,
  facetSearchQuery,
  facetValues,
  field,
  i18n,
  resultIndexToFocusOnShowMore,
}: FlatCategoryFacetProps) => {
  if (!facetValues.length) {
    return <Fragment></Fragment>;
  }

  const renderChild = function (
    facetValue: CategoryFacetValue,
    isShowLessFocusTarget: boolean,
    isShowMoreFocusTarget: boolean
  ) {
    const displayValue = getFieldValueCaption(field, facetValue.value, i18n);
    const isSelected = facetValue.state === 'selected';
    const leafOrNodePart = facetValue.isLeafValue ? 'leaf-value' : 'node-value';

    return (
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={i18n}
        onClick={getOnClickForUnselectedValue(facet, focusTargets.activeValue)}
        searchQuery={facetSearchQuery}
        buttonRef={(element) => {
          isShowLessFocusTarget &&
            focusTargets.showLessFocus.setTarget(element);
          isShowMoreFocusTarget &&
            focusTargets.showMoreFocus.setTarget(element);
        }}
        additionalPart={leafOrNodePart}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  };

  return facetValues.map((value, i) =>
    renderChild(value, i === 0, i === resultIndexToFocusOnShowMore)
  );
};
