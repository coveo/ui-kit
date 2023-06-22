import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../../common/button';

export const FeedbackButton: FunctionalComponent<{
  title: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}> = (props) => (
  <Button
    title={props.title}
    style="text-neutral"
    class={`feedback-button ${props.active ? 'text-bg-blue' : ''}`}
    onClick={props.onClick}
    ariaPressed={`${props.active}`}
  >
    <atomic-icon class="w-5" icon={props.icon}></atomic-icon>
  </Button>
);
