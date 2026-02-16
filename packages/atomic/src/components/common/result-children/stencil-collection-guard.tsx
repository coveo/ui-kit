import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {ResultsPlaceholder} from '../atomic-result-placeholder/stencil-placeholders';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../layout/display-options';
import {ChildrenWrapper} from './stencil-children-wrapper';

interface CollectionGuardProps {
  isLoadingMoreResults: boolean;
  moreResultsAvailable: boolean;
  hasChildren: boolean;
  numberOfChildren: number;
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
  noResultText: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CollectionGuard: FunctionalComponent<CollectionGuardProps> = (
  {
    isLoadingMoreResults,
    moreResultsAvailable,
    hasChildren,
    numberOfChildren,
    density,
    imageSize,
    noResultText,
  },
  children
) => {
  if (isLoadingMoreResults) {
    return (
      <ChildrenWrapper hasChildren={hasChildren}>
        <ResultsPlaceholder
          numberOfPlaceholders={numberOfChildren}
          density={density}
          display={'list'}
          imageSize={imageSize}
        />
      </ChildrenWrapper>
    );
  }

  if (!moreResultsAvailable && !hasChildren) {
    return noResultText.trim().length ? (
      <p part="no-result-root" class="no-result-root my-3">
        {noResultText}
      </p>
    ) : null;
  }

  if (!hasChildren) {
    return;
  }

  return <Fragment>{children}</Fragment>;
};
