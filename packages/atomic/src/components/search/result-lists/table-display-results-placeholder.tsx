import {ResultsPerPageState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from '../../common/result-list/result-list';

export const TableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps<ResultsPerPageState>
> = (props) => {
  return (
    <atomic-result-table-placeholder
      density={props.density}
      imageSize={props.imageSize!}
      rows={props.resultsPerPageState.numberOfResults}
    ></atomic-result-table-placeholder>
  );
};
