import {FunctionalComponent, h} from '@stencil/core';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

interface FacetValueLabelHighlightProps {
  displayValue: string;
  searchQuery?: string;
  isSelected: boolean;
  isExcluded?: boolean;
}

export const FacetValueLabelHighlight: FunctionalComponent<
  FacetValueLabelHighlightProps
> = (props) => {
  const activeColor = props.isExcluded ? 'error' : 'primary';
  console.log(props.displayValue, props.isSelected || !!props.isExcluded);
  return (
    // deepcode ignore ReactSetInnerHtml: This is not React code
    <span
      title={props.displayValue}
      part="value-label"
      class={`value-label truncate group-hover:text-${activeColor} group-focus:text-${activeColor} ${
        props.isSelected || !!props.isExcluded ? 'font-bold' : ''
      } test-class-hover:text-error`}
      innerHTML={highlightSearchResult(props.displayValue, props.searchQuery)}
    ></span>
  );
};
