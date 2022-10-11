import {FunctionalComponent, h} from '@stencil/core';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';

export interface ResultPlaceholderProps {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
  numberOfPlaceholders: number;
}

export const ResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
  return Array.from({length: props.numberOfPlaceholders}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display={props.display || 'list'}
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
