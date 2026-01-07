import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface Suggestion {
  highlightedValue: string;
  rawValue: string;
}

interface Props {
  suggestion: Suggestion;
  hasQuery: boolean;
}

export const renderQuerySuggestionText: FunctionalComponent<Props> = ({
  props: {suggestion, hasQuery},
}) => {
  if (hasQuery) {
    return html`<span
      part="query-suggestion-text"
      class="line-clamp-2 break-all"
      .innerHTML=${suggestion.highlightedValue}
    ></span>`;
  }

  return html`<span part="query-suggestion-text" class="line-clamp-2 break-all"
    >${suggestion.rawValue}</span
  >`;
};
