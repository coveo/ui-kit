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

export const getQuerySummaryI18nParameters = ({
  first,
  last,
  query,
  total,
  isLoading,
  i18n,
}: i18nKeyProps) => {
  const i18nKey =
    query !== '' ? 'showing-results-of-with-query' : 'showing-results-of';

  const params = {
    first: first.toLocaleString(),
    last: last.toLocaleString(),
    total: total.toLocaleString(),
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
    ? i18n.t('loading-results')
    : i18n.t(i18nKey, params);

  return {i18nKey, highlights, ariaLiveMessage};
};
