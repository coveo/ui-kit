import {FunctionalComponent, h} from '@stencil/core';
import Thumbs from '../../../images/thumbs.svg';
import {Button} from '../button';

type FeedbackVariant = 'like' | 'dislike';

interface FeedbackButtonProps {
  title: string;
  variant: FeedbackVariant;
  active: boolean;
  onClick: () => void;
}

export const FeedbackButton: FunctionalComponent<FeedbackButtonProps> = (
  props
) => {
  return (
    <Button
      title={props.title}
      style="text-transparent"
      part="feedback-button"
      class={`feedback-button p-2 rounded-md ${props.variant} ${
        props.active ? 'active' : ''
      }`}
      onClick={props.onClick}
      ariaPressed={`${props.active}`}
    >
      <atomic-icon class="w-5" icon={Thumbs}></atomic-icon>
    </Button>
  );
};
