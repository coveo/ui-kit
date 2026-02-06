import type {GeneratedAnswerBase} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {TemplateResult} from 'lit';
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';
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
  renderCitationsSlot: () => TemplateResult | typeof nothing;
  onRetry: () => void;
  onClickShowButton: () => void;
}

/**
 * Renders the answer content of a given generated answer including question, answer text, and citations.
 */
export const renderAnswerContent: FunctionalComponent<
  RenderAnswerContentProps
> = ({props}) => {
  const {
    i18n,
    generatedAnswer,
    collapsible,
    renderFeedbackAndCopyButtonsSlot,
    renderCitationsSlot,
    onRetry,
    onClickShowButton,
  } = props;

  const {
    answer,
    question,
    isStreaming,
    citations,
    answerContentFormat,
    expanded,
    error,
  } = generatedAnswer;
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
      ${
        hasRetryableError
          ? renderRetryPrompt({
              props: {
                onClick: onRetry,
                buttonLabel: i18n.t('retry'),
                message: i18n.t('retry-stream-message'),
              },
            })
          : nothing
      }
      ${
        !hasRetryableError
          ? renderGeneratedContentContainer({
              props: {
                answer,
                answerContentFormat,
                isStreaming: !!isStreaming,
              },
            })(html`
            ${renderSourceCitations({
              props: {
                label: i18n.t('citations'),
                isVisible: !!citations?.length,
              },
            })(renderCitationsSlot())}
          `)
          : nothing
      }
      ${
        !hasRetryableError
          ? html`
            <div part="generated-answer-footer" class="mt-6">
              ${renderGeneratingAnswerLabel({
                props: {i18n, isStreaming: !!isStreaming, collapsible},
              })}
              ${
                collapsible && !isStreaming
                  ? renderShowButton({
                      props: {
                        i18n,
                        onClick: onClickShowButton,
                        isCollapsed: !expanded,
                      },
                    })
                  : nothing
              }
            </div>
          `
          : nothing
      }
    </div>
  `;
};
