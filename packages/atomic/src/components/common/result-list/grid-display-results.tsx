import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../interface/bindings';
import {ResultsProps} from './result-list-common';

export const GridDisplayResults: FunctionalComponent<
  ResultsProps<AnyBindings>
> = (props) => {
  return props.resultListState.results.map((result, index) => {
    console.log(result);

    return (
      <div
        part="result-list-grid-clickable-container outline"
        ref={(element) =>
          element &&
          props.indexOfResultToFocus === index &&
          props.newResultRef?.(element)
        }
      >
        TODO
      </div>
    );
  });
};
