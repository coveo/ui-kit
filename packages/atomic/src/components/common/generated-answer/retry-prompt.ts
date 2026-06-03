import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RetryPromptProps {
  message: string;
  buttonLabel: string;
  onClick: () => void;
}

export const renderRetryPrompt: FunctionalComponent<RetryPromptProps> = ({
  props: {message, buttonLabel, onClick},
}) =>
  html`<div part="retry-container" class="mt-4">
    <div class="text-neutral-dark mx-auto text-center">${message}</div>
    ${renderButton({
      props: {
        style: 'outline-primary',
        class: 'mx-auto mt-4 block px-4 py-2',
        onClick,
      },
    })(html`${buttonLabel}`)}
  </div>`;
