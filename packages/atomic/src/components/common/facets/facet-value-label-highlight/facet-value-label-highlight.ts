import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {highlightSearchResult} from '../facet-search/facet-search-utils';

interface FacetValueLabelHighlightProps {
  displayValue: string;
  searchQuery?: string;
  isSelected: boolean;
  isExcluded?: boolean;
}

export const renderFacetValueLabelHighlight: FunctionalComponent<
  FacetValueLabelHighlightProps
> = ({props}) => {
  const classNames = tw({
    'value-label peer-hover:text-error truncate': true,
    'font-bold': props.isSelected || !!props.isExcluded,
  });
  return html`<span
    title=${props.displayValue}
    part="value-label"
    class=${multiClassMap(classNames)}
    .innerHTML=${highlightSearchResult(props.displayValue, props.searchQuery)}
  ></span>`;
};
