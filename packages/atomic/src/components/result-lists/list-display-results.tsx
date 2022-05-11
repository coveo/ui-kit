import {FunctionalComponent, h} from '@stencil/core';
import {ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result, i) => {
    return (
      <atomic-result
        key={props.resultListCommon.getResultId(result, props.resultListState)}
        result={result}
        engine={props.bindings.engine}
        display={props.display}
        density={props.density}
        imageSize={props.imageSize}
        content={props.getContentOfResultTemplate(result)}
        firstResultToRender={i === 0}
      ></atomic-result>
    );
  });
};
