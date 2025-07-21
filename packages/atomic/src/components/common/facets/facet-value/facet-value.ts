import type {i18n} from 'i18next';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {renderFacetValueBox} from '../facet-value-box/facet-value-box';
import {renderFacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {renderFacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '../facet-value-link/facet-value-link';

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
  setRef?: (btn?: Element) => void;
}

export const renderFacetValue: FunctionalComponent<FacetValueProps> = ({
  props: {
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
  },
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
      return renderFacetValueCheckbox({
        props: {
          ...triStateProps,
          displayValue,
          numberOfResults: facetCount,
          isSelected,
          i18n,
          onClick: onSelect,
          searchQuery: facetSearchQuery,
          buttonRef: (element) => {
            setRef?.(element as HTMLButtonElement | undefined);
          },
        },
      })(
        renderFacetValueLabelHighlight({
          props: {
            displayValue,
            isSelected,
            isExcluded,
            searchQuery: facetSearchQuery,
          },
        })
      );
    case 'link':
      return renderFacetValueLink({
        props: {
          displayValue,
          numberOfResults: facetCount,
          isSelected,
          i18n,
          onClick: onSelect,
          searchQuery: facetSearchQuery,
          buttonRef: (element) => {
            setRef?.(element);
          },
        },
      })(
        renderFacetValueLabelHighlight({
          props: {
            displayValue,
            isSelected,
            searchQuery: facetSearchQuery,
          },
        })
      );

    case 'box':
      return renderFacetValueBox({
        props: {
          displayValue,
          numberOfResults: facetCount,
          isSelected,
          i18n,
          onClick: onSelect,
          searchQuery: facetSearchQuery,
          buttonRef: (element) => {
            setRef?.(element);
          },
        },
      })(
        renderFacetValueLabelHighlight({
          props: {
            displayValue,
            isSelected,
            searchQuery: facetSearchQuery,
          },
        })
      );
  }
};
