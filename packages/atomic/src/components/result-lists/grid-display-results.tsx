import {buildInteractiveResult} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {ResultsProps} from './result-list-common';

export const GridDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result, i) => {
    const interactiveResult = buildInteractiveResult(props.bindings.engine, {
      options: {result: props.resultListCommon.getUnfoldedResult(result)},
    });

    return (
      <div part="result-list-grid-clickable-container">
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
          href={props.resultListCommon.getUnfoldedResult(result).clickUri}
          target="_self"
          title={props.resultListCommon.getUnfoldedResult(result).title}
        />
        <atomic-result
          key={props.resultListCommon.getResultId(
            result,
            props.resultListState
          )}
          result={result}
          engine={props.bindings.engine}
          display={props.display}
          density={props.density}
          imageSize={props.imageSize}
          content={props.getContentOfResultTemplate(result)}
          firstResultToRender={i === 0}
        ></atomic-result>
      </div>
    );
  });
};
