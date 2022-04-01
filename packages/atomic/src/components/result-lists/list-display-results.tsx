import {FunctionalComponent, h} from '@stencil/core';
import {getId, ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result) => {
    return (
      <atomic-result
        key={getId(result, props.resultListState)}
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
