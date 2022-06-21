import {FunctionalComponent, h} from '@stencil/core';
import {ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  return props.resultListState.results.map((result, index) => {
    return (
      <atomic-result
        key={props.resultListCommon.getResultId(result, props.resultListState)}
        part="outline"
        result={result}
        engine={props.bindings.engine}
        store={props.bindings.store}
        content={props.getContentOfResultTemplate(result)}
        loadingFlag={props.resultListCommon.loadingFlag}
        ref={(element) =>
          element &&
          props.indexOfResultToFocus === index &&
          props.newResultRef?.(element)
        }
        {...props}
      ></atomic-result>
    );
  });
};
