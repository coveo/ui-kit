import {CategoryFacet, CategoryFacetValue} from '@coveo/headless';
import {FunctionalComponent, VNode, h} from '@stencil/core';
import {i18n} from 'i18next';
import LeftArrow from '../../../../../images/arrow-left-rounded.svg';
import {FocusTargetController} from '../../../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../../../utils/field-utils';
import {Button} from '../../../../common/button';
import {FacetValueLabelHighlight} from '../../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../../../../common/facets/facet-value-link/facet-value-link';

interface HierarchicalCategoryFacetProps {
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

export const HierarchicalCategoryFacet: FunctionalComponent<
  HierarchicalCategoryFacetProps
> = ({
  focusTargets,
  facet,
  facetSearchQuery,
  facetValues,
  field,
  i18n,
}: HierarchicalCategoryFacetProps) => {
  function renderAllCategoriesButton() {
    const allCategories = i18n.t('all-categories');
    return (
      <Button
        style="text-neutral"
        part="all-categories-button"
        onClick={() => {
          focusTargets.activeValue.focusAfterSearch();
          facet.deselectAll();
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
    if (facetValue.state === 'selected') {
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
          focusTargets.activeValue.focusAfterSearch();
          facet.deselectAll();
        }}
        searchQuery={facetSearchQuery}
        part={`active-parent ${getIsLeafOrNodePart(facetValue)}`}
        class="contents"
        buttonRef={focusTargets.activeValue.setTarget}
        subList={children.length > 0 && <ul part="values">{children}</ul>}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={facetValue.state === 'selected'}
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
        isSelected={true}
        i18n={i18n}
        onClick={() => {
          focusTargets.activeValue.focusAfterSearch();
          facet.toggleSelect(facetValue);
        }}
        searchQuery={facetSearchQuery}
        part={`value-link ${getIsLeafOrNodePart(facetValue)}`}
        class="contents"
        buttonRef={focusTargets.activeValue.setTarget}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={facetValue.state === 'selected'}
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
          onClick={() => {
            focusTargets.activeValue.focusAfterSearch();
            facet.toggleSelect(facetValue);
          }}
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

  function getIsLeafOrNodePart(value: CategoryFacetValue) {
    return value.isLeafValue ? 'leaf-value' : 'node-value';
  }
  return (
    <li class="contents">
      {renderAllCategoriesButton()}
      <ul part="sub-parents">{renderValuesTree(facetValues)}</ul>
    </li>
  );
};
