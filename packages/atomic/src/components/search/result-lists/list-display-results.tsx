import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../../common/interface/bindings';
import {ResultsProps} from './result-list-common';

export const ListDisplayResults: FunctionalComponent<
  ResultsProps<AnyBindings>
> = (props) => {
  return props.resultListState.results.map((result, index) => {
    return (
      <atomic-result
        key={props.resultListCommon.getResultId(result, props.resultListState)}
        part="outline"
        result={result}
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
