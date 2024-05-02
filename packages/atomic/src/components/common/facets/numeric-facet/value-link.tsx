import {FunctionalComponent, h} from '@stencil/core';
import {FacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {FacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {FacetValueLink} from '../facet-value-link/facet-value-link';
import {FormatFacetValueRange, formatHumanReadable} from './formatter';

interface NumericFacetValueLinkProps extends FormatFacetValueRange {
  onClick: () => void;
  logger: Pick<Console, 'error'>;
  displayValuesAs: 'checkbox' | 'link';
}

export const NumericFacetValueLink: FunctionalComponent<
  NumericFacetValueLinkProps
> = (props) => {
  const {facetValue, displayValuesAs, i18n, onClick} = props;
  const displayValue = formatHumanReadable(props);
  const isSelected = facetValue.state === 'selected';
  switch (displayValuesAs) {
    case 'checkbox':
      return (
        <FacetValueCheckbox
          displayValue={displayValue}
          numberOfResults={facetValue.numberOfResults}
          isSelected={isSelected}
          i18n={i18n}
          onClick={() => onClick()}
        >
          <FacetValueLabelHighlight
            displayValue={displayValue}
            isSelected={isSelected}
          ></FacetValueLabelHighlight>
        </FacetValueCheckbox>
      );
    case 'link':
      return (
        <FacetValueLink
          displayValue={displayValue}
          numberOfResults={facetValue.numberOfResults}
          isSelected={isSelected}
          i18n={i18n}
          onClick={onClick}
        >
          <FacetValueLabelHighlight
            displayValue={displayValue}
            isSelected={isSelected}
          ></FacetValueLabelHighlight>
        </FacetValueLink>
      );
  }
};
