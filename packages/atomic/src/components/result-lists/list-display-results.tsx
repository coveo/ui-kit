import {buildInteractiveResult} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {getId, ResultsProps, unfolded} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result) => {
    const content = props.getContentOfResultTemplate(result);

    const atomicResult = (
      <atomic-result
        key={getId(result, props.resultListState)}
        result={result}
        engine={props.bindings.engine}
        display={props.display}
        density={props.density}
        imageSize={props.imageSize ?? props.image}
        content={content}
      ></atomic-result>
    );

    return props.display === 'grid' ? (
      <LinkWithResultAnalytics
        part="result-list-grid-clickable"
        interactiveResult={buildInteractiveResult(props.bindings.engine, {
          options: {result: unfolded(result)},
        })}
        href={unfolded(result).clickUri}
        target="_self"
      >
        {atomicResult}
      </LinkWithResultAnalytics>
    ) : (
      atomicResult
    );
  });
};
