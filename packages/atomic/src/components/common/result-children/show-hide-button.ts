import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ShowHideButtonProps {
  moreResultsAvailable: boolean;
  loadFullCollection: () => void;
  showInitialChildren: boolean;
  toggleShowInitialChildren: () => void;
  loadAllResults: string;
  collapseResults: string;
}

export const renderShowHideButton: FunctionalComponent<ShowHideButtonProps> = ({
  props,
}) => {
  const handleClick = () => {
    if (props.moreResultsAvailable) {
      props.loadFullCollection();
    }
    props.toggleShowInitialChildren();
  };

  const buttonText =
    props.showInitialChildren || props.moreResultsAvailable
      ? props.loadAllResults
      : props.collapseResults;

  return renderButton({
    props: {
      part: 'show-hide-button',
      class: 'show-hide-button',
      style: 'text-primary',
      onClick: handleClick,
    },
  })(html`${buttonText}`);
};
