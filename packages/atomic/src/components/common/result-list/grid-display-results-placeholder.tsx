import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from './result-list-common';

export const GridDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return Array.from({length: props.numberOfPlaceholder}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display="grid"
      imageSize={props.imageSize!}
    ></atomic-result-placeholder>
  ));
};
