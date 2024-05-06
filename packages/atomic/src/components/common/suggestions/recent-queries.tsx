import {HighlightUtils} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
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

export const RecentQueriesContainer: FunctionalComponent = (_, children) => {
  return (
    <div
      part="recent-query-content"
      class="flex items-center break-all text-left"
    >
      {children}
    </div>
  );
};

interface RecentQueryIconProps {
  icon: string;
}

export const RecentQueryIcon: FunctionalComponent<RecentQueryIconProps> = ({
  icon,
}) => {
  return (
    <atomic-icon
      part="recent-query-icon"
      icon={icon}
      class="w-4 h-4 mr-2 shrink-0"
    ></atomic-icon>
  );
};

interface RecentQueryTextProps {
  query: string;
  value: string;
}

export const RecentQueryText: FunctionalComponent<RecentQueryTextProps> = ({
  query,
  value,
}) => {
  if (query === '') {
    return (
      <span part="recent-query-text" class="break-all line-clamp-2">
        {value}
      </span>
    );
  }
  return (
    <span
      part="recent-query-text"
      class="break-all line-clamp-2"
      innerHTML={HighlightUtils.highlightString({
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
    ></span>
  );
};

interface RecentQueryClearProps {
  i18n: i18n;
}

export const RecentQueryClear: FunctionalComponent<RecentQueryClearProps> = ({
  i18n,
}) => {
  return (
    <div part="recent-query-title-content" class="flex justify-between w-full">
      <span class="font-bold" part="recent-query-title">
        {i18n.t('recent-searches')}
      </span>
      <span part="recent-query-clear">{i18n.t('clear')}</span>
    </div>
  );
};
