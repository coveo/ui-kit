import {FunctionalComponent, h} from '@stencil/core';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

interface FacetValueLabelHighlightProps {
  displayValue: string;
  searchQuery?: string;
  isSelected: boolean;
}

export const FacetValueLabelHighlight: FunctionalComponent<FacetValueLabelHighlightProps> = (
  props
) => {
  return (
    <span
      title={props.displayValue}
      part="value-label"
      class={`value-label w-full truncate group-hover:text-primary-light group-focus:text-primary-light ${
        props.isSelected ? 'font-bold' : ''
      }`}
      innerHTML={highlightSearchResult(props.displayValue, props.searchQuery)}
    ></span>
  );
};
