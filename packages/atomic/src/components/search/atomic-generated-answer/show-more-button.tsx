import {FunctionalComponent, h} from '@stencil/core';
import ArrowBottomIcon from '../../../images/arrow-bottom-rounded.svg';
import {Button} from '../../common/button';

interface ShowMoreButtonProps {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  isOpen: boolean;
}

export const ShowMoreButton: FunctionalComponent<ShowMoreButtonProps> = (
  props
) => {
  const label = props.label;
  const ariaLabel = props.ariaLabel;

  return (
    <Button
      style="text-primary"
      onClick={props.onClick}
      part="show-more-button"
      ariaExpanded={`${props.isOpen}`}
      ariaLabel={ariaLabel}
      class="p-2"
    >
      <span
        title={label}
        part="value-label"
        class={
          'truncate mr-1.5 group-hover:text-primary-light group-focus:text-primary'
        }
      >
        {label}
      </span>
      <atomic-icon
        part="arrow-icon"
        class={`w-2 ml-auto group-hover:text-primary-light group-focus:text-primary ${
          props.isOpen ? 'rotate-180' : ''
        }`}
        icon={ArrowBottomIcon}
      ></atomic-icon>
    </Button>
  );
};
