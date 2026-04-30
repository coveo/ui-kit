import {html} from 'lit';

/**
 * Renders the custom "no answer" message container.
 */
export const renderCustomNoAnswerMessage = () => {
  return html`
    <div part="generated-container" class="mt-6 break-words px-6 pb-6">
      <slot name="no-answer-message"></slot>
    </div>
  `;
};
