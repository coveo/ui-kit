import {FunctionalComponent, h} from '@stencil/core';
import {AtomicResultListBase} from './result-list-common';

export const ResultsPlaceholder: FunctionalComponent<
  Pick<
    AtomicResultListBase,
    'display' | 'density' | 'imageSize' | 'image' | 'resultsPerPageState'
  >
> = (props) => {
  if (props.display === 'table') {
    return (
      <atomic-result-table-placeholder
        density={props.density}
        imageSize={props.imageSize ?? props.image}
        rows={props.resultsPerPageState.numberOfResults}
      ></atomic-result-table-placeholder>
    );
  }
  return Array.from(
    {length: props.resultsPerPageState.numberOfResults},
    (_, i) => (
      <atomic-result-placeholder
        key={`placeholder-${i}`}
        density={props.density}
        display="list"
        imageSize={props.imageSize ?? props.image}
      ></atomic-result-placeholder>
    )
  );
};
