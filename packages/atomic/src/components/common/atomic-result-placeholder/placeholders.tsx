import {FunctionalComponent, h} from '@stencil/core';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options';

export interface ResultPlaceholderProps {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  display: ItemDisplayLayout;
  numberOfPlaceholders: number;
}

export const ResultsPlaceholdersGuard: FunctionalComponent<
  ResultPlaceholderProps & {displayPlaceholders: boolean}
> = (props) => {
  if (!props.displayPlaceholders) {
    return;
  }
  switch (props.display) {
    case 'table':
      return <TableDisplayResultsPlaceholder {...props} />;
    default:
      return <ResultsPlaceholder {...props} />;
  }
};

export const ResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
  return Array.from({length: props.numberOfPlaceholders}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display={props.display || 'list'}
    ></atomic-result-placeholder>
  ));
};

const TableDisplayResultsPlaceholder: FunctionalComponent<
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
