import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/display-options';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface CollectionGuardProps {
  isLoadingMoreResults: boolean;
  moreResultsAvailable: boolean;
  hasChildren: boolean;
  numberOfChildren: number;
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  noResultText: string;
}

export const renderCollectionGuard: FunctionalComponentWithChildren<
  CollectionGuardProps
> =
  ({props}) =>
  (children) => {
    const {
      isLoadingMoreResults,
      moreResultsAvailable,
      hasChildren,
      numberOfChildren,
      density,
      imageSize,
      noResultText,
    } = props;

    if (isLoadingMoreResults) {
      return renderChildrenWrapper({props: {hasChildren}})(
        renderItemPlaceholders({
          props: {
            numberOfPlaceholders: numberOfChildren,
            density,
            display: 'list',
            imageSize,
          },
        })
      );
    }

    if (!moreResultsAvailable && !hasChildren) {
      return when(
        noResultText.trim().length > 0,
        () => html`<p part="no-result-root" class="no-result-root my-3">
          ${noResultText}
        </p>`,
        () => nothing
      );
    }

    if (!hasChildren) {
      return nothing;
    }

    return children;
  };

interface ChildrenWrapperProps {
  hasChildren: boolean;
}

const renderChildrenWrapper: FunctionalComponentWithChildren<
  ChildrenWrapperProps
> =
  ({props}) =>
  (children) => {
    const {hasChildren} = props;

    return html`<div part="children-root">
      ${when(hasChildren, () => html`<slot name="before-children"></slot>`)}
      ${children}
      ${when(hasChildren, () => html`<slot name="after-children"></slot>`)}
    </div>`;
  };
