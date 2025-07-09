import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ItemPlaceholdersProps {
  density: ItemDisplayDensity;
  display: ItemDisplayLayout;
  imageSize: ItemDisplayImageSize;
  numberOfPlaceholders: number;
}

export const renderItemPlaceholders: FunctionalComponent<
  ItemPlaceholdersProps
> = ({props}) => {
  const {display} = props;

  if (display === 'table') {
    return renderTableItemPlaceholders({props});
  }
  return renderGridOrListItemPlaceholders({props});
};

const renderGridOrListItemPlaceholders: FunctionalComponent<
  ItemPlaceholdersProps
> = ({props}) => {
  const placeholders = Array.from({length: props.numberOfPlaceholders});
  return html`${map(
    placeholders,
    (i) =>
      html`${keyed(
        `placeholder-${i}`,
        html`<atomic-result-placeholder
          .density=${props.density}
          .display=${props.display}
          .imageSize=${props.imageSize}
        ></atomic-result-placeholder>`
      )}`
  )}`;
};

const renderTableItemPlaceholders: FunctionalComponent<
  Omit<ItemPlaceholdersProps, 'display'>
> = ({props}) => {
  return html`<atomic-result-table-placeholder
    .density=${props.density}
    .imageSize=${props.imageSize}
    .rows=${props.numberOfPlaceholders}
  ></atomic-result-table-placeholder>`;
};
