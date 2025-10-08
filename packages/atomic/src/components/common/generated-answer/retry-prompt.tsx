import {FunctionalComponent, h} from '@stencil/core';
import {Button} from '../stencil-button';

interface RetryPromptProps {
  message: string;
  buttonLabel: string;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const RetryPrompt: FunctionalComponent<RetryPromptProps> = (props) => (
  <div part="retry-container" class="mt-4">
    <div class="text-neutral-dark mx-auto text-center">{props.message}</div>
    <Button
      class="mx-auto mt-4 block px-4 py-2"
      style="outline-primary"
      onClick={props.onClick}
    >
      {props.buttonLabel}
    </Button>
  </div>
);
