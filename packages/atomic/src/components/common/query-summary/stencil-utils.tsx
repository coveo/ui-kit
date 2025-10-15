import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';

interface i18nKeyProps {
  first: number;
  last: number;
  total: number;
  query: string;
  isLoading: boolean;
  i18n: i18n;
}

interface QuerySummaryLabels {
  loadingStatus: string;
  itemsForQuery: string;
  allItems: string;
}

const WrapHighlight: FunctionalComponent<{part?: string}> = (
  props,
  children
) => {
  return (
    <span
      class="font-bold"
      part={`highlight${props.part ? ` ${props.part}` : ''}`}
    >
      {children}
    </span>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const getQuerySummaryI18nParameters = (props: i18nKeyProps) => {
  return getQuerySummaryData(props, {
    loadingStatus: 'loading-results',
    itemsForQuery: 'showing-results-of-with-query',
    allItems: 'showing-results-of',
  });
};

const getQuerySummaryData = (
  {first, last, query, total, isLoading, i18n}: i18nKeyProps,
  {allItems, itemsForQuery, loadingStatus}: QuerySummaryLabels
) => {
  const i18nKey = query !== '' ? itemsForQuery : allItems;

  const locale = i18n.language;
  const params = {
    first: first.toLocaleString(locale),
    last: last.toLocaleString(locale),
    total: total.toLocaleString(locale),
    query: query,
    count: last,
  };

  const highlights = {
    first: <WrapHighlight>{params.first}</WrapHighlight>,
    last: <WrapHighlight>{params.last}</WrapHighlight>,
    total: <WrapHighlight>{params.total}</WrapHighlight>,
    query: <WrapHighlight part="query">{params.query}</WrapHighlight>,
  };

  const ariaLiveMessage = isLoading
    ? i18n.t(loadingStatus)
    : i18n.t(i18nKey, params);

  return {i18nKey, highlights, ariaLiveMessage};
};
