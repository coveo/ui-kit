import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from './result-list-common';

export const TableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return (
    <atomic-result-table-placeholder
      density={props.density}
      imageSize={props.imageSize ?? props.image}
      rows={props.resultsPerPageState.numberOfResults}
    ></atomic-result-table-placeholder>
  );
};
