import {buildInteractiveResult} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {ResultsProps} from './result-list-common';

export const GridDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result) => (
    <LinkWithResultAnalytics
      part="result-list-grid-clickable"
      interactiveResult={buildInteractiveResult(props.bindings.engine, {
        options: {result: props.resultListCommon.getUnfoldedResult(result)},
      })}
      href={props.resultListCommon.getUnfoldedResult(result).clickUri}
      target="_self"
    >
      <atomic-result
        key={props.resultListCommon.getResultId(result, props.resultListState)}
        result={result}
        engine={props.bindings.engine}
        display={props.display}
        density={props.density}
        imageSize={props.imageSize}
        content={props.getContentOfResultTemplate(result)}
      ></atomic-result>
    </LinkWithResultAnalytics>
  ));
};
