import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

/**
 * Renders the custom "no answer" message container.
 */
export const renderCustomNoAnswerMessage: FunctionalComponent = () => {
  return html`
      <div part="generated-container" class="mt-6 break-words px-6 pb-6">
        <slot name="no-answer-message"></slot>
      </div>
  `;
};
