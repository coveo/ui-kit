import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../button';

interface RetryPromptProps {
  message: string;
  buttonLabel: string;
  onClick: () => void;
}

export const RetryPrompt: FunctionalComponent<RetryPromptProps> = (props) => (
  <div part="retry-container" class="mt-4">
    <div class="mx-auto text-center text-neutral-dark">{props.message}</div>
    <Button
      class="block px-4 py-2 mt-4 mx-auto"
      style="outline-primary"
      onClick={props.onClick}
    >
      {props.buttonLabel}
    </Button>
  </div>
);
