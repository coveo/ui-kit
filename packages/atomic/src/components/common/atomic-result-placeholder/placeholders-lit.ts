import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html, nothing} from 'lit';

interface ResultPlaceholderProps {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  display: ItemDisplayLayout;
  numberOfPlaceholders: number;
}

interface ResultPlaceholderGuardProps extends ResultPlaceholderProps {
  displayPlaceholders: boolean;
}

export const resultsPlaceholdersGuard: FunctionalComponent<
  ResultPlaceholderGuardProps
> = ({props}) => {
  if (!props.displayPlaceholders) {
    return nothing;
  }
  if (props.display === 'table') {
    return html`${tableDisplayResultsPlaceholder({props})}`;
  }

  return html`${resultsPlaceholder({props})}`;
};

export const resultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = ({props}) => {
  return Array.from(
    {length: props.numberOfPlaceholders},
    (_, i) =>
      html` <atomic-result-placeholder
        key="{placeholder-${i}}"
        density="{${props.density}}"
        display="{${props.display || 'list'}}"
        imageSize="{${props.imageSize}}"
      ></atomic-result-placeholder>`
  );
};

const tableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = ({props}) => {
  return html` <atomic-result-table-placeholder
    density="{${props.density}}"
    imageSize="{${props.imageSize}}"
    rows="{${props.numberOfPlaceholders}}"
  ></atomic-result-table-placeholder>`;
};
