import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderFacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {renderFacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '../facet-value-link/facet-value-link';
import {type FormatFacetValueRange, formatHumanReadable} from './formatter';

export interface NumericFacetValueLinkProps extends FormatFacetValueRange {
  onClick: () => void;
  logger: Pick<Console, 'error'>;
  displayValuesAs: 'checkbox' | 'link';
}

export const renderNumericFacetValue: FunctionalComponent<
  NumericFacetValueLinkProps
> = ({props}) => {
  const {facetValue, displayValuesAs, i18n, onClick} = props;
  const displayValue = formatHumanReadable(props);
  const isSelected = facetValue.state === 'selected';
  switch (displayValuesAs) {
    case 'checkbox':
      return renderFacetValueCheckbox({
        props: {
          displayValue,
          numberOfResults: facetValue.numberOfResults,
          isSelected,
          i18n,
          onClick: () => onClick(),
        },
      })(
        renderFacetValueLabelHighlight({
          props: {
            displayValue,
            isSelected,
          },
        })
      );
    case 'link':
      return renderFacetValueLink({
        props: {
          displayValue,
          numberOfResults: facetValue.numberOfResults,
          isSelected,
          i18n,
          onClick,
        },
      })(
        renderFacetValueLabelHighlight({
          props: {
            displayValue,
            isSelected,
          },
        })
      );
    default:
      return html`${nothing}`;
  }
};
