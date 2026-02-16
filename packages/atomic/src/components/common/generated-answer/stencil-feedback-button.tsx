import {FunctionalComponent, h} from '@stencil/core';
import Thumbs from '../../../images/thumbs.svg';
import {Button} from '../stencil-button';

type FeedbackVariant = 'like' | 'dislike';

interface FeedbackButtonProps {
  title: string;
  variant: FeedbackVariant;
  active: boolean;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FeedbackButton: FunctionalComponent<FeedbackButtonProps> = (
  props
) => {
  return (
    <Button
      title={props.title}
      style="text-transparent"
      part="feedback-button"
      class={`feedback-button rounded-md p-2 ${props.variant} ${
        props.active ? 'active' : ''
      }`}
      onClick={props.onClick}
      ariaPressed={`${props.active}`}
    >
      <atomic-icon class="w-5" icon={Thumbs}></atomic-icon>
    </Button>
  );
};
