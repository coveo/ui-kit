import {ResultsPerPageState} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from '../../common/result-list/result-list';

export const GridDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps<ResultsPerPageState>
> = (props) => {
  return Array.from(
    {length: props.resultsPerPageState.numberOfResults},
    (_, i) => (
      <atomic-result-placeholder
        key={`placeholder-${i}`}
        density={props.density}
        display="grid"
        imageSize={props.imageSize!}
      ></atomic-result-placeholder>
    )
  );
};
