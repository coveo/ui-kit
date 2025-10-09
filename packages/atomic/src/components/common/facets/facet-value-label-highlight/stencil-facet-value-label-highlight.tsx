import {FunctionalComponent, h} from '@stencil/core';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

interface FacetValueLabelHighlightProps {
  displayValue: string;
  searchQuery?: string;
  isSelected: boolean;
  isExcluded?: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValueLabelHighlight: FunctionalComponent<
  FacetValueLabelHighlightProps
> = (props) => {
  return (
    // deepcode ignore ReactSetInnerHtml: This is not React code
    <span
      title={props.displayValue}
      part="value-label"
      class={`value-label peer-hover:text-error truncate ${
        props.isSelected || !!props.isExcluded ? 'font-bold' : ''
      }`}
      innerHTML={highlightSearchResult(props.displayValue, props.searchQuery)}
    ></span>
  );
};
