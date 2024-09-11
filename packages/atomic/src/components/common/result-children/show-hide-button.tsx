import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../button';

interface ShowHideButtonProps {
  moreResultsAvailable: boolean;
  loadFullCollection: () => void;
  showInitialChildren: boolean;
  toggleShowInitialChildren: () => void;
  loadAllResults: string;
  collapseResults: string;
}

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
          toggleShowInitialChildren();
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
