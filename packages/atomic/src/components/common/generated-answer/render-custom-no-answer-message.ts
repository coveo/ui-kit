import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderCustomNoAnswerMessageProps {
  i18n: i18n;
}

/**
 * Renders the custom "no answer" message container.
 */
export const renderCustomNoAnswerMessage: FunctionalComponent<
  RenderCustomNoAnswerMessageProps
> = () => {
  return html`
      <div part="generated-container" class="mt-6 break-words px-6 pb-6">
        <slot name="no-answer-message"></slot>
      </div>
  `;
};
