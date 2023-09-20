import {CategoryFacetValue} from '@coveo/headless';
import {FunctionalComponent, VNode, h} from '@stencil/core';
import LeftArrow from '../../../../../images/arrow-left-rounded.svg';
import {getFieldValueCaption} from '../../../../../utils/field-utils';
import {Button} from '../../../../common/button';
import {FacetValueLabelHighlight} from '../../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../../common/facets/facet-value-link/facet-value-link';
import {
  CategoryFacetValueRendererProps,
  getIsLeafOrNodePart,
  getOnClickForUnselectedValue,
  isValueSelected,
} from './commons';

export const HierarchicalCategoryFacet: FunctionalComponent<
  CategoryFacetValueRendererProps
> = ({
  focusTargets,
  facet,
  facetSearchQuery,
  facetValues,
  field,
  i18n,
}: CategoryFacetValueRendererProps) => {
  function renderAllCategoriesButton() {
    const allCategories = i18n.t('all-categories');
    return (
      <Button
        style="text-neutral"
        part="all-categories-button"
        onClick={() => {
          focusTargets.activeValueFocus.focusAfterSearch();
          facet.clearAll();
        }}
      >
        <atomic-icon
          aria-hidden="true"
          icon={LeftArrow}
          part="back-arrow"
        ></atomic-icon>
        <span class="truncate">{allCategories}</span>
      </Button>
    );
  }

  function renderValuesTree(currentValues: CategoryFacetValue[]): VNode[] {
    return currentValues.map((parent) => {
      const renderedChildren = renderValuesTree(parent.children);
      return renderHierarchicalValue(parent, renderedChildren);
    });
  }

  function renderHierarchicalValue(
    facetValue: CategoryFacetValue,
    children: VNode[]
  ): VNode {
    const displayValue = getFieldValueCaption(field, facetValue.value, i18n);
    if (isValueSelected(facetValue)) {
      return renderSelectedValue(facetValue, displayValue, children);
    }
    if (facetValue.children.length === 0) {
      return renderLeafValue(facetValue, displayValue);
    }
    return renderNodeValue(facetValue, displayValue, children);
  }

  function renderSelectedValue(
    facetValue: CategoryFacetValue,
    displayValue: string,
    children: VNode[]
  ) {
    return (
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={true}
        i18n={i18n}
        onClick={() => {
          focusTargets.activeValueFocus.focusAfterSearch();
          facet.clearAll();
        }}
        searchQuery={facetSearchQuery}
        part={`active-parent ${getIsLeafOrNodePart(facetValue)}`}
        class="contents"
       buttonRef={(el)=> focusTargets.activeValueFocus.setTarget(el)}
        subList={children.length > 0 && <ul part="values">{children}</ul>}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={true}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  }

  function renderLeafValue(
    facetValue: CategoryFacetValue,
    displayValue: string
  ) {
    return (
      <FacetValueLink
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={false}
        i18n={i18n}
        onClick={() => {
          focusTargets.activeValueFocus.focusAfterSearch();
          facet.selectValue(facetValue);
        }}
        searchQuery={facetSearchQuery}
        part={`value-link ${getIsLeafOrNodePart(facetValue)}`}
        class="contents"
        buttonRef={(el)=> focusTargets.activeValueFocus.setTarget(el)}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={false}
        ></FacetValueLabelHighlight>
      </FacetValueLink>
    );
  }

  function renderNodeValue(
    facetValue: CategoryFacetValue,
    displayValue: string,
    children: VNode[]
  ) {
    const ariaLabel = i18n.t('facet-value', {
      value: displayValue,
      count: facetValue.numberOfResults,
    });
    return (
      <li class="contents">
        <Button
          style="text-neutral"
          part="parent-button"
          ariaPressed="false"
          onClick={getOnClickForUnselectedValue(
            facet,
            facetValue,
            focusTargets.activeValueFocus
          )}
          ariaLabel={ariaLabel}
        >
          <atomic-icon
            icon={LeftArrow}
            part="back-arrow"
            class="back-arrow"
          ></atomic-icon>
          <span class="truncate">{displayValue}</span>
        </Button>
        {children.length > 0 && <ul part="sub-parents">{children}</ul>}
      </li>
    );
  }

  return (
    <ul part="parents" class="mt-3">
      <li class="contents">
        {renderAllCategoriesButton()}
        <ul part="sub-parents">{renderValuesTree(facetValues)}</ul>
      </li>
    </ul>
  );
};
