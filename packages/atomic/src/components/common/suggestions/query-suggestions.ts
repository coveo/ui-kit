import {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import {SearchBoxSuggestionElement} from './suggestions-common';

interface Suggestion {
  highlightedValue: string;
  rawValue: string;
}

export const getPartialSearchBoxSuggestionElement = (
  suggestion: Suggestion,
  i18n: i18n
): Pick<SearchBoxSuggestionElement, 'ariaLabel' | 'key' | 'query' | 'part'> => {
  return {
    part: 'query-suggestion-item',
    key: `qs-${encodeForDomAttribute(suggestion.rawValue)}`,
    query: suggestion.rawValue,
    ariaLabel: i18n.t('query-suggestion-label', {
      query: suggestion.rawValue,
      interpolation: {escapeValue: false},
    }),
  };
};

export const querySuggestionContainer: FunctionalComponentWithChildren<{}> =
  () => (children) => {
    return html`<div part="query-suggestion-content" class="flex items-center">
      ${children}
    </div>`;
  };

interface QuerySuggestionIconProps {
  icon: string;
  hasSuggestion: boolean;
}

export const querySuggestionIcon: FunctionalComponent<
  QuerySuggestionIconProps
> = ({props: {hasSuggestion, icon}}) => {
  if (!hasSuggestion) {
    return nothing;
  }

  return html`<atomic-icon
    part="query-suggestion-icon"
    icon=${icon}
    class="mr-2 h-4 w-4 shrink-0"
  ></atomic-icon>`;
};

interface QuerySuggestionTextProps {
  suggestion: Suggestion;
  hasQuery: boolean;
}

export const querySuggestionText: FunctionalComponent<
  QuerySuggestionTextProps
> = ({props: {hasQuery, suggestion}}) => {
  if (hasQuery) {
    return html`<span
      part="query-suggestion-text"
      class="line-clamp-2 break-all"
      >${unsafeHTML(suggestion.highlightedValue)}</span
    >`;
  }

  return html`<span part="query-suggestion-text" class="line-clamp-2 break-all"
    >${suggestion.rawValue}</span
  >`;
};
