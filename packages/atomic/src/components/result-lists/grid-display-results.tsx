import {buildInteractiveResult} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {ResultsProps} from './result-list-common';

export const GridDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result) => {
    const interactiveResult = buildInteractiveResult(props.bindings.engine, {
      options: {result: props.resultListCommon.getUnfoldedResult(result)},
    });

    const sharedPropsBetweenBothMode = {
      key: props.resultListCommon.getResultId(result, props.resultListState),
      result,
      engine: props.bindings.engine,
      store: props.bindings.store,
      loadingFlag: props.resultListCommon.loadingFlag,
      ...props,
    };

    const atomicResult = props.renderingFunction ? (
      <atomic-result
        renderingFunction={props.renderingFunction}
        {...sharedPropsBetweenBothMode}
      ></atomic-result>
    ) : (
      <atomic-result
        content={props.getContentOfResultTemplate(result)}
        {...sharedPropsBetweenBothMode}
      ></atomic-result>
    );

    return (
      <div part="result-list-grid-clickable-container outline">
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
          href={props.resultListCommon.getUnfoldedResult(result).clickUri}
          target="_self"
          title={props.resultListCommon.getUnfoldedResult(result).title}
        />

        {atomicResult}
      </div>
    );
  });
};
