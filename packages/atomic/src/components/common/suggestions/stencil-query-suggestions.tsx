import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {encodeForDomAttribute} from '../../../utils/string-utils.js';
import {SearchBoxSuggestionElement} from './suggestions-types.js';

interface Suggestion {
  highlightedValue: string;
  rawValue: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuerySuggestionContainer: FunctionalComponent = (_, children) => {
  return (
    <div part="query-suggestion-content" class="flex items-center">
      {children}
    </div>
  );
};

interface QuerySuggestionIconProps {
  icon: string;
  hasSuggestion: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuerySuggestionIcon: FunctionalComponent<
  QuerySuggestionIconProps
> = ({icon, hasSuggestion}) => {
  if (!hasSuggestion) {
    return;
  }

  return (
    <atomic-icon
      part="query-suggestion-icon"
      icon={icon}
      class="mr-2 h-4 w-4 shrink-0"
    ></atomic-icon>
  );
};

interface QuerySuggestionTextProps {
  suggestion: Suggestion;
  hasQuery: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuerySuggestionText: FunctionalComponent<
  QuerySuggestionTextProps
> = ({suggestion, hasQuery}) => {
  if (hasQuery) {
    return (
      <span
        part="query-suggestion-text"
        class="line-clamp-2 break-all"
        innerHTML={suggestion.highlightedValue}
      ></span>
    );
  }

  return (
    <span part="query-suggestion-text" class="line-clamp-2 break-all">
      {suggestion.rawValue}
    </span>
  );
};
