import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';

export interface ResultPlaceholderProps {
  density: ItemDisplayDensity;
  display: ItemDisplayLayout;
  imageSize: ItemDisplayImageSize;
  numberOfPlaceholders: number;
}

export const renderResultPlaceholders: FunctionalComponent<
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

export const renderTableResultPlaceholders: FunctionalComponent<
  Omit<ResultPlaceholderProps, 'display'>
> = ({props}) => {
  return html`<atomic-result-table-placeholder
    .density=${props.density}
    .imageSize=${props.imageSize}
    .rows=${props.numberOfPlaceholders}
  ></atomic-result-table-placeholder>`;
};
