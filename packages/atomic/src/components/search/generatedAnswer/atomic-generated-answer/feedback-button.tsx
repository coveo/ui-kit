import {FunctionalComponent, h} from '@stencil/core';
import ThumbsDownIcon from '../../../../images/thumbs-down.svg';
import ThumbsUpIcon from '../../../../images/thumbs-up.svg';
import {Button} from '../../../common/button';

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
  const getIcon = () => {
    return props.variant === 'like' ? ThumbsUpIcon : ThumbsDownIcon;
  };

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
      <atomic-icon class="w-5" icon={getIcon()}></atomic-icon>
    </Button>
  );
};
