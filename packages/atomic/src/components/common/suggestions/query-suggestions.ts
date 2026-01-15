import type {i18n} from 'i18next';
import {html, nothing, render} from 'lit';
import {encodeForDomAttribute} from '../../../utils/string-utils.js';
import type {SearchBoxSuggestionElement} from './suggestions-types.js';

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

export interface RenderQuerySuggestionOptions {
  icon: string;
  hasQuery: boolean;
  suggestion: Suggestion;
  hasMultipleKindOfSuggestions: boolean;
  /**
   * When true, the icon will always be displayed regardless of hasMultipleKindOfSuggestions.
   * Used by the insight search box where icons should always be visible.
   */
  alwaysShowIcon?: boolean;
}

export const renderQuerySuggestion = ({
  icon,
  hasQuery,
  suggestion,
  hasMultipleKindOfSuggestions,
  alwaysShowIcon = false,
}: RenderQuerySuggestionOptions): HTMLElement => {
  const shouldShowIcon = alwaysShowIcon || hasMultipleKindOfSuggestions;
  const template = html`
    <div part="query-suggestion-content" class="pointer-events-none flex items-center">${
      shouldShowIcon
        ? html`<atomic-icon
          part="query-suggestion-icon"
          icon=${icon}
          class="mr-2 h-4 w-4 shrink-0"
        ></atomic-icon>`
        : nothing
    }${
      hasQuery
        ? html`<span
          part="query-suggestion-text"
          class="line-clamp-2 break-all"
          .innerHTML=${suggestion.highlightedValue}
        ></span>`
        : html`<span part="query-suggestion-text" class="line-clamp-2 break-all">${suggestion.rawValue}</span>`
    }</div>
  `;

  const container = document.createElement('div');
  render(template, container);
  return container.firstElementChild as HTMLElement;
};
