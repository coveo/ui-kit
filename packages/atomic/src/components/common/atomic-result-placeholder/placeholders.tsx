import {FunctionalComponent, h} from '@stencil/core';
import {ResultPlaceholderProps} from '../result-list/result-list';

export const ListDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return Array.from({length: props.numberOfPlaceholders}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display="list"
      imageSize={props.imageSize!}
      isChild={props.isChild}
    ></atomic-result-placeholder>
  ));
};

export const GridDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return Array.from({length: props.numberOfPlaceholders}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display="grid"
      imageSize={props.imageSize!}
    ></atomic-result-placeholder>
  ));
};

export const TableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return (
    <atomic-result-table-placeholder
      density={props.density}
      imageSize={props.imageSize!}
      rows={props.numberOfPlaceholders}
    ></atomic-result-table-placeholder>
  );
};
