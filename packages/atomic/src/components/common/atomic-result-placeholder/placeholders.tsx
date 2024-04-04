import {FunctionalComponent, h} from '@stencil/core';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';

interface ResultPlaceholderProps {
  density: ResultDisplayDensity;
  imageSize: ResultDisplayImageSize;
  display: ResultDisplayLayout;
  numberOfPlaceholders: number;
}

interface ResultPlaceholderGuardProps extends ResultPlaceholderProps {
  displayPlaceholders: boolean;
}

export const ResultsPlaceholdersGuard: FunctionalComponent<
  ResultPlaceholderGuardProps
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
      imageSize={props.imageSize}
    ></atomic-result-placeholder>
  ));
};

const TableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return (
    <atomic-result-table-placeholder
      density={props.density}
      imageSize={props.imageSize}
      rows={props.numberOfPlaceholders}
    ></atomic-result-table-placeholder>
  );
};
