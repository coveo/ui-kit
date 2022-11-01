import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {LocalizedString} from '../../../utils/jsx-utils';
import {AnyBindings} from '../interface/bindings';

interface QuerySummaryCommonProps {
  bindings: AnyBindings;
  withDuration: boolean;
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

export const QuerySummaryCommon: FunctionalComponent<
  QuerySummaryCommonProps
> = (props) => {
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

  const key = props.querySummaryState.hasQuery
    ? 'showing-results-of-with-query'
    : 'showing-results-of';

  const params = {
    first: props.querySummaryState.firstResult.toLocaleString(),
    last: props.querySummaryState.lastResult.toLocaleString(),
    total: props.querySummaryState.total.toLocaleString(),
    query: props.querySummaryState.query,
    count: props.querySummaryState.lastResult,
  };

  if (props.querySummaryState.hasResults) {
    if (props.querySummaryState.isLoading) {
      props.setAriaLive(props.bindings.i18n.t('loading-results'));
    } else {
      props.setAriaLive(props.bindings.i18n.t(key, params));
    }
  }

  const paramsWithHighlights = {
    first: <WrapHighlight>{params.first}</WrapHighlight>,
    last: <WrapHighlight>{params.last}</WrapHighlight>,
    total: <WrapHighlight>{params.total}</WrapHighlight>,
    query: <WrapHighlight part="query">{params.query}</WrapHighlight>,
  };

  return (
    <div class="text-on-background" part="container">
      {props.querySummaryState.hasResults && (
        <Fragment>
          <LocalizedString
            key={key}
            bindings={props.bindings}
            params={paramsWithHighlights}
            count={params.count}
          />
          {props.withDuration && props.querySummaryState.hasDuration && (
            <span class="hidden" part="duration">
              &nbsp;
              <LocalizedString
                key="in-seconds"
                bindings={props.bindings}
                params={{
                  count:
                    props.querySummaryState.durationInSeconds.toLocaleString(),
                }}
              />
            </span>
          )}
        </Fragment>
      )}
    </div>
  );
};
