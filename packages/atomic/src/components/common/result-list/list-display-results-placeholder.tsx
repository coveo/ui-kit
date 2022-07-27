import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from './result-list-common';

export const ListDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return Array.from({length: props.numberOfPlaceholder}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display="list"
      imageSize={props.imageSize!}
      isChild={props.isChild}
    ></atomic-result-placeholder>
  ));
};
