import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../interface/bindings';
import escape from 'escape-html';

interface QuerySummaryCommonProps {
  bindings: AnyBindings;
  enableDuration: boolean;
  querySummaryState: {
    hasDuration: boolean;
    durationInSeconds: number;
    lastResult: number;
    firstResult: number;
    total: number;
    query: string;
    isLoading: boolean;
    hasQuery: boolean;
    hasError: boolean;
    firstSearchExecuted: boolean;
    hasResults: boolean;
  };
  setAriaLive: (message: string) => void;
}

export const QuerySummaryCommon: FunctionalComponent<
  QuerySummaryCommonProps
> = (props) => {
  const getDurationInSeconds = (count: number) =>
    props.bindings.i18n.t('in-seconds', {count});

  const renderDuration = () => {
    const shouldShow =
      props.enableDuration && props.querySummaryState.hasDuration;
    return `<span class="${
      shouldShow ? '' : 'hidden'
    }" part="duration"> ${getDurationInSeconds(
      props.querySummaryState.durationInSeconds
    )}</span>`;
  };

  const wrapHighlight = (content: string) => {
    return `<span class="font-bold" part="highlight">${content}</span>`;
  };

  const wrapQuery = (content: string) => {
    return `<span class="font-bold" part="highlight query">${content}</span>`;
  };

  const getResultOfProps = () => {
    const locales = props.bindings.i18n.languages as string[];
    return {
      count: props.querySummaryState.lastResult,
      first: props.querySummaryState.firstResult.toLocaleString(locales),
      last: props.querySummaryState.lastResult.toLocaleString(locales),
      total: props.querySummaryState.total.toLocaleString(locales),
      query: props.querySummaryState.query,
    };
  };

  const getHighlightedResultOfProps = () => {
    const {first, last, total, query, ...options} = getResultOfProps();
    return {
      ...options,
      interpolation: {escapeValue: false},
      first: wrapHighlight(first),
      last: wrapHighlight(last),
      total: wrapHighlight(total),
      query: wrapQuery(escape(query)),
    };
  };

  const getSummary = () => {
    if (props.querySummaryState.isLoading) {
      return props.bindings.i18n.t('loading-results');
    }
    return props.bindings.i18n.t(
      props.querySummaryState.hasQuery
        ? 'showing-results-of-with-query'
        : 'showing-results-of',
      getResultOfProps()
    );
  };

  const renderHasResults = () => {
    const content = props.bindings.i18n.t(
      props.querySummaryState.hasQuery
        ? 'showing-results-of-with-query'
        : 'showing-results-of',
      getHighlightedResultOfProps()
    );

    return (
      // deepcode ignore ReactSetInnerHtml: This is not React code
      <div
        part="results"
        class="overflow-hidden overflow-ellipsis"
        innerHTML={content + renderDuration()}
      ></div>
    );
  };

  if (props.querySummaryState.hasError) {
    return;
  }

  if (!props.querySummaryState.firstSearchExecuted) {
    return (
      <div
        part="placeholder"
        aria-hidden="true"
        class="h-6 my-2 w-60 bg-neutral rounded animate-pulse"
      ></div>
    );
  }

  if (props.querySummaryState.hasResults) {
    props.setAriaLive(getSummary());
  }

  return (
    <div class="text-on-background" part="container">
      {props.querySummaryState.hasResults && renderHasResults()}
    </div>
  );
};
