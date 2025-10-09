// The Lit equivalent of this file is item-placeholders.ts. The Lit version doesn't include the placeholder guard.
import {FunctionalComponent, h} from '@stencil/core';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../layout/display-options.js';

interface ResultPlaceholderProps {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  display: ItemDisplayLayout;
  numberOfPlaceholders: number;
}

interface ResultPlaceholderGuardProps extends ResultPlaceholderProps {
  displayPlaceholders: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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

/**
 * @deprecated should only be used for Stencil components.
 */
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
