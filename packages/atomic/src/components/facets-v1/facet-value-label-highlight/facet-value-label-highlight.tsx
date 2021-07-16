import {FunctionalComponent, h} from '@stencil/core';
import {FacetLabelProps} from '../facet-common';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

export const FacetValueLabelHighlight: FunctionalComponent<FacetLabelProps> = (
  props
) => {
  return (
    <span
      title={props.displayValue}
      part="value-label"
      class={`value-label ellipsed ${props.isSelected ? 'font-bold' : ''}`}
      innerHTML={highlightSearchResult(props.displayValue, props.searchQuery)}
    ></span>
  );
};
