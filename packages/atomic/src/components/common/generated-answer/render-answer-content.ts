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

type GeneratedAnswer = GeneratedAnswerBase & {
  expanded?: boolean;
};

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
 * Renders the answer content of a given generated answer including answer text and citations.
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

  const {answer, isStreaming, citations, answerContentFormat, expanded, error} =
    generatedAnswer;
  const isExpanded = collapsible ? expanded : true;
  const hasRetryableError = error?.isRetryable === true;
  const shouldDisplayFeedbackButtons =
    !hasRetryableError && (collapsible ? expanded : true);

  return html`
    <div>
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
      ${when(
        !hasRetryableError && isExpanded,
        () => html`
          <div class="mt-4" part="feedback-and-copy-buttons">
            ${renderFeedbackAndCopyButtonsSlot()}
          </div>
        `
      )}
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
                        isCollapsed: expanded === false,
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
