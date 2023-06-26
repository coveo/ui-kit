import {FunctionalComponent, h} from '@stencil/core';
import ThumbsDownIcon from '../../../images/thumbs-down.svg';
import ThumbsUpIcon from '../../../images/thumbs-up.svg';
import {Button} from '../../common/button';

type FeedbackVariant = 'like' | 'dislike';

export const FeedbackButton: FunctionalComponent<{
  title: string;
  variant: FeedbackVariant;
  active: boolean;
  onClick: () => void;
}> = (props) => {
  const getBackgroundClass = () => {
    if (!props.active) {
      return '';
    }
    return props.variant === 'like' ? 'bg-green' : 'bg-red';
  };

  const getIcon = () => {
    return props.variant === 'like' ? ThumbsUpIcon : ThumbsDownIcon;
  };
  return (
    <Button
      title={props.title}
      style="text-neutral"
      class={`feedback-button ${getBackgroundClass()}`}
      onClick={props.onClick}
      ariaPressed={`${props.active}`}
    >
      <atomic-icon class="w-5" icon={getIcon()}></atomic-icon>
    </Button>
  );
};
