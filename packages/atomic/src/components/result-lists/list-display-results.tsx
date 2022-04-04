import {FunctionalComponent, h} from '@stencil/core';
import {ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result) => {
    return (
      <atomic-result
        key={props.resultListCommon.getResultId(result, props.resultListState)}
        result={result}
        engine={props.bindings.engine}
        display={props.display}
        density={props.density}
        imageSize={props.imageSize ?? props.image}
        content={props.getContentOfResultTemplate(result)}
      ></atomic-result>
    );
  });
};
