import type {GeneratedAnswerBase} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {TemplateResult} from 'lit';
import {html, type nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';

interface GeneratedAnswer extends GeneratedAnswerBase {
  question: string;
  expanded?: boolean;
}

export interface RenderAnswerContentProps {
  i18n: i18n;
  generatedAnswer: GeneratedAnswer;
  collapsible: boolean;
  renderFeedbackAndCopyButtonsSlot: () => TemplateResult | typeof nothing;
}

/**
 * Renders the answer content of a given generated answer including question, answer text, and citations.
 */
export const renderAnswerHeader: FunctionalComponent<
  RenderAnswerContentProps
> = ({props}) => {
  const {generatedAnswer, collapsible, renderFeedbackAndCopyButtonsSlot} =
    props;

  const {question, expanded, error} = generatedAnswer;
  const isExpanded = collapsible ? expanded : true;
  const trimmedQuestion = question.trim();
  const hasRetryableError = error?.isRetryable === true;

  return html`
    <div>
      <div class="mt-6 flex gap-3">
        <p
          class="question-text min-w-0 flex-1 text-base font-semibold leading-6"
        >
          ${trimmedQuestion}
        </p>
        ${when(
          !hasRetryableError && isExpanded,
          () => html`
            <div
              part="feedback-and-copy-buttons"
              class="flex h-9 shrink-0 items-center justify-end gap-2"
            >
              ${renderFeedbackAndCopyButtonsSlot()}
            </div>
          `
        )}
      </div>
    </div>
  `;
};
