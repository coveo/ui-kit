import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';

interface ResultPlaceholderProps {
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  display: ItemDisplayLayout;
  numberOfPlaceholders: number;
}

export const ResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = ({props}) => {
  return Array.from(
    {length: props.numberOfPlaceholders},
    (_, i) =>
      html`${keyed(
        `placeholder-${i}`,
        html`<atomic-result-placeholder
          .density=${props.density}
          .display=${props.display}
          .imageSize=${props.imageSize}
        ></atomic-result-placeholder>`
      )}`
  );
};

export const TableDisplayResultsPlaceholder: FunctionalComponent<
  Omit<ResultPlaceholderProps, 'display'>
> = ({props}) => {
  return html` <atomic-result-table-placeholder
    .density=${props.density}
    .imageSize=${props.imageSize}
    .rows=${props.numberOfPlaceholders}
  ></atomic-result-table-placeholder>`;
};
