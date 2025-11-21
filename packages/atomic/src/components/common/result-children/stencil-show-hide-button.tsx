import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../stencil-button';

 interface ShowHideButtonProps {
  moreResultsAvailable: boolean;
  loadFullCollection: () => void;
  showInitialChildren: boolean;
  toggleShowInitialChildren: () => void;
  loadAllResults: string;
  collapseResults: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ShowHideButton: FunctionalComponent<ShowHideButtonProps> = ({
  moreResultsAvailable,
  loadFullCollection,
  showInitialChildren,
  toggleShowInitialChildren,
  loadAllResults,
  collapseResults,
}) => {
  return (
    <Button
      part="show-hide-button"
      class="show-hide-button"
      style="text-primary"
      onClick={() => {
        if (moreResultsAvailable) {
          loadFullCollection();
        }
        toggleShowInitialChildren();
      }}
    >
      {showInitialChildren || moreResultsAvailable
        ? loadAllResults
        : collapseResults}
    </Button>
  );
};
