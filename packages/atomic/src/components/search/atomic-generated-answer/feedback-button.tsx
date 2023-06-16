import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../common/button';

export const FeedbackButton: FunctionalComponent<{
  title: string;
  icon: string;
  onClick: () => void;
}> = (props) => (
  <Button
    title={props.title}
    style="text-neutral"
    class="feedback-button"
    onClick={props.onClick}
  >
    <atomic-icon class="w-5" icon={props.icon}></atomic-icon>
  </Button>
);
