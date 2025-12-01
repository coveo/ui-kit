import {HighlightUtils} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, render} from 'lit';
import {when} from 'lit/directives/when.js';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import type {SearchBoxSuggestionElement} from './suggestions-types';

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

export interface RecentQueriesContainerProps {
  icon: string;
  query: string;
  value: string;
}

export const renderRecentQuery = ({
  icon,
  query,
  value,
}: RecentQueriesContainerProps): HTMLElement => {
  const hasQuery = query !== '';

  const template = html`<div
    part="recent-query-content"
    class="pointer-events-none flex items-center text-left break-all"
  >
    <atomic-icon
      part="recent-query-icon"
      icon=${icon}
      class="mr-2 h-4 w-4 shrink-0"
    ></atomic-icon>

    ${when(
      hasQuery,
      () =>
        html`<span
          part="recent-query-text"
          class="line-clamp-2 break-words"
          .innerHTML=${HighlightUtils.highlightString({
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
          })}
        ></span>`,
      () =>
        html`<span part="recent-query-text" class="line-clamp-2 break-all">
          ${value}
        </span>`
    )}
  </div>`;

  const container = document.createElement('div');
  render(template, container);
  return container.firstElementChild as HTMLElement;
};

export const renderRecentQueryClear = ({i18n}: {i18n: i18n}): HTMLElement => {
  const template = html` <div
    part="recent-query-title-content"
    class="pointer-events-none flex w-full justify-between"
  >
    <span class="font-bold" part="recent-query-title">
      ${i18n.t('recent-searches')}
    </span>
    <span part="recent-query-clear">${i18n.t('clear')}</span>
  </div>`;

  const container = document.createElement('div');
  render(template, container);
  return container.firstElementChild as HTMLElement;
};
