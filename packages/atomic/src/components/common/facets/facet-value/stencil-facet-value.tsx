import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {FacetValueBox} from '../facet-value-box/stencil-facet-value-box';
import {FacetValueCheckbox} from '../facet-value-checkbox/stencil-facet-value-checkbox';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/stencil-facet-value-label-highlight';
import {FacetValueLink} from '../facet-value-link/stencil-facet-value-link';

/**
 * @deprecated should only be used for Stencil components.
 */
export interface FacetValueProps {
  field: string;
  facetValue: string;
  facetCount: number;
  facetState: 'idle' | 'selected' | 'excluded';
  i18n: i18n;
  enableExclusion: boolean;
  onExclude: () => void;
  onSelect: () => void;
  displayValuesAs: 'checkbox' | 'link' | 'box';
  facetSearchQuery: string;
  setRef?: (btn?: HTMLButtonElement) => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValue: FunctionalComponent<FacetValueProps> = ({
  facetSearchQuery,
  displayValuesAs,
  enableExclusion,
  facetCount,
  facetState,
  facetValue,
  field,
  i18n,
  onExclude,
  onSelect,
  setRef,
}) => {
  const displayValue = getFieldValueCaption(field, facetValue, i18n);
  const isSelected = facetState === 'selected';
  const isExcluded = facetState === 'excluded';
  const triStateProps = enableExclusion
    ? {
        onExclude,
        state: facetState,
      }
    : {};
  switch (displayValuesAs) {
    case 'checkbox':
      return (
        <FacetValueCheckbox
          {...triStateProps}
          displayValue={displayValue}
          numberOfResults={facetCount}
          isSelected={isSelected}
          i18n={i18n}
          onClick={onSelect}
          searchQuery={facetSearchQuery}
          buttonRef={(element) => {
            setRef && setRef(element);
          }}
        >
          <FacetValueLabelHighlight
            displayValue={displayValue}
            isSelected={isSelected}
            isExcluded={isExcluded}
            searchQuery={facetSearchQuery}
          ></FacetValueLabelHighlight>
        </FacetValueCheckbox>
      );
    case 'link':
      return (
        <FacetValueLink
          displayValue={displayValue}
          numberOfResults={facetCount}
          isSelected={isSelected}
          i18n={i18n}
          onClick={onSelect}
          searchQuery={facetSearchQuery}
          buttonRef={(element) => {
            setRef && setRef(element);
          }}
        >
          <FacetValueLabelHighlight
            displayValue={displayValue}
            isSelected={isSelected}
            searchQuery={facetSearchQuery}
          ></FacetValueLabelHighlight>
        </FacetValueLink>
      );
    case 'box':
      return (
        <FacetValueBox
          displayValue={displayValue}
          numberOfResults={facetCount}
          isSelected={isSelected}
          i18n={i18n}
          onClick={onSelect}
          searchQuery={facetSearchQuery}
          buttonRef={(element) => {
            setRef && setRef(element);
          }}
        >
          <FacetValueLabelHighlight
            displayValue={displayValue}
            isSelected={isSelected}
            searchQuery={facetSearchQuery}
          ></FacetValueLabelHighlight>
        </FacetValueBox>
      );
  }
};
