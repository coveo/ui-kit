import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

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

const renderWrapHighlight: FunctionalComponent<{
  part?: string;
  content: string;
}> = ({props}) => {
  const part = `highlight${props.part ? ` ${props.part}` : ''}`;
  return html`<span class="font-bold" part="${part}">${props.content}</span>`;
};

export const getQuerySummaryI18nParameters = (props: i18nKeyProps) => {
  return getQuerySummaryData(props, {
    loadingStatus: 'loading-results',
    itemsForQuery: 'showing-results-of-with-query',
    allItems: 'showing-results-of',
  });
};

export const getProductQuerySummaryI18nParameters = (props: i18nKeyProps) => {
  return getQuerySummaryData(props, {
    loadingStatus: 'loading-products',
    itemsForQuery: 'showing-products-of-with-query',
    allItems: 'showing-products-of',
  });
};

const getQuerySummaryData = (
  {first, last, query, total, isLoading, i18n}: i18nKeyProps,
  {allItems, itemsForQuery, loadingStatus}: QuerySummaryLabels
) => {
  const i18nKey = query === '' ? allItems : itemsForQuery;

  const locale = i18n.language;
  const params = {
    first: first.toLocaleString(locale),
    last: last.toLocaleString(locale),
    total: total.toLocaleString(locale),
    query: query,
    count: last,
  };

  const highlights = {
    first: renderWrapHighlight({props: {content: params.first}}),
    last: renderWrapHighlight({props: {content: params.last}}),
    total: renderWrapHighlight({props: {content: params.total}}),
    query: renderWrapHighlight({props: {part: 'query', content: params.query}}),
  };

  const ariaLiveMessage = isLoading
    ? i18n.t(loadingStatus)
    : `${i18n.t('results-loaded')} ${i18n.t(i18nKey, params)}`;

  return {i18nKey, highlights, ariaLiveMessage};
};
