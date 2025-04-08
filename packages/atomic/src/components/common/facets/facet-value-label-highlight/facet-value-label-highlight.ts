import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
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
  const classNames = {
    'value-label peer-hover:text-error truncate': true,
    'font-bold': props.isSelected || !!props.isExcluded,
  };
  // TODO: check if should use innerHTML hack
  return html`<span
    title=${props.displayValue}
    part="value-label"
    class=${classMap(classNames)}
    >${highlightSearchResult(props.displayValue, props.searchQuery)}</span
  >`;
  // .innerHTML="{highlightSearchResult(props.displayValue,"
  // props.searchQuery)}
};
