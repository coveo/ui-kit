import {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {HighlightUtils} from '@coveo/headless';
import {i18n} from 'i18next';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import {SearchBoxSuggestionElement} from './suggestions-common';

export const getPartialRecentQueryElement = (
  value: string,
  i18n: i18n
): Pick<SearchBoxSuggestionElement, 'ariaLabel' | 'key' | 'query' | 'part'> => {
  return {
    part: 'recent-query-item',
    query: value,
    key: `recent-${encodeForDomAttribute(value)}`,
    ariaLabel: i18n.t('recent-query-suggestion-label', {
      query: value,
      interpolation: {escapeValue: false},
    }),
  };
};

export const getPartialRecentQueryClearElement = (
  i18n: i18n
): Pick<
  SearchBoxSuggestionElement,
  'ariaLabel' | 'key' | 'part' | 'hideIfLast'
> => {
  return {
    key: 'recent-query-clear',
    ariaLabel: i18n.t('clear-recent-searches', {
      interpolation: {escapeValue: false},
    }),
    part: 'recent-query-title-item suggestion-divider',
    hideIfLast: true,
  };
};

export const recentQueriesContainer: FunctionalComponentWithChildren<{}> =
  () => (children) => {
    return html`<div
      part="recent-query-content"
      class="flex items-center text-left break-all"
    >
      ${children}
    </div>`;
  };

interface RecentQueryIconProps {
  icon: string;
}

export const recentQueryIcon: FunctionalComponent<RecentQueryIconProps> = ({
  props: {icon},
}) => {
  return html`
    <atomic-icon
      part="recent-query-icon"
      icon=${icon}
      class="mr-2 h-4 w-4 shrink-0"
    ></atomic-icon>
  `;
};

interface RecentQueryTextProps {
  query: string;
  value: string;
}

export const recentQueryText: FunctionalComponent<RecentQueryTextProps> = ({
  props: {query, value},
}) => {
  if (query === '') {
    return html`<span part="recent-query-text" class="line-clamp-2 break-all">
      ${value}
    </span>`;
  }
  const innerHTML = HighlightUtils.highlightString({
    content: value,
    openingDelimiter:
      '<span part="recent-query-text-highlight" class="font-bold">',
    closingDelimiter: '</span>',
    highlights: [
      {
        offset: query.length,
        length: value.length - query.length,
      },
    ],
  });
  return html`<span part="recent-query-text" class="line-clamp-2 break-all"
    >${unsafeHTML(innerHTML)}</span
  >`;
};

interface RecentQueryClearProps {
  i18n: i18n;
}

export const recentQueryClear: FunctionalComponent<RecentQueryClearProps> = ({
  props: {i18n},
}) => {
  return html`<div
    part="recent-query-title-content"
    class="flex w-full justify-between"
  >
    <span class="font-bold" part="recent-query-title">
      ${i18n.t('recent-searches')}
    </span>
    <span part="recent-query-clear">${i18n.t('clear')}</span>
  </div>`;
};
