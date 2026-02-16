import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {renderChildrenWrapper} from '@/src/components/common/result-children/children-wrapper';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface CollectionGuardProps {
  isLoadingMoreResults: boolean;
  moreResultsAvailable: boolean;
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
      numberOfChildren,
      density,
      imageSize,
      noResultText,
    } = props;

    const hasChildren = numberOfChildren > 0;

    if (isLoadingMoreResults) {
      const placeholders = renderItemPlaceholders({
        props: {
          numberOfPlaceholders: numberOfChildren,
          density,
          display: 'list',
          imageSize,
        },
      });

      return hasChildren
        ? renderChildrenWrapper()(placeholders)
        : html`<div part="children-root">${placeholders}</div>`;
    }

    if (!moreResultsAvailable && !hasChildren) {
      return when(
        noResultText.trim().length > 0,
        () => html`<p part="no-result-root" class="no-result-root my-3">
          ${noResultText}
        </p>`
      );
    }

    if (!hasChildren) {
      return nothing;
    }

    return children;
  };
