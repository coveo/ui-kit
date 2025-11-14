import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponentNoChildren} from '@/src/utils/functional-component-utils';

interface ShowHideButtonProps {
  moreResultsAvailable: boolean;
  loadFullCollection: () => void;
  showInitialChildren: boolean;
  toggleShowInitialChildren: () => void;
  loadAllResults: string;
  collapseResults: string;
}

export const renderShowHideButton: FunctionalComponentNoChildren<
  ShowHideButtonProps
> = ({props}) => {
  const {
    moreResultsAvailable,
    loadFullCollection,
    showInitialChildren,
    toggleShowInitialChildren,
    loadAllResults,
    collapseResults,
  } = props;

  return renderButton({
    props: {
      style: 'text-primary',
      part: 'show-hide-button',
      class: 'show-hide-button',
      onClick: () => {
        if (moreResultsAvailable) {
          loadFullCollection();
          toggleShowInitialChildren();
        }

        toggleShowInitialChildren();
      },
    },
  })(
    html`${
      showInitialChildren || moreResultsAvailable
        ? loadAllResults
        : collapseResults
    }`
  );
};
