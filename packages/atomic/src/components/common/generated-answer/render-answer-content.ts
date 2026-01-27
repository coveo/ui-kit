import type {GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {TemplateResult} from 'lit';
import {html, nothing} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderDisclaimer} from './render-disclaimer';
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';
import '@/src/components/common/atomic-icon/atomic-icon';

export interface RenderAnswerContentProps {
  i18n: i18n;
  generatedAnswerState: GeneratedAnswerState | undefined;
  question: string;
  isAnswerVisible: boolean;
  hasRetryableError: boolean;
  toggleTooltip: string;
  withToggle: boolean;
  collapsible: boolean;
  renderFeedbackAndCopyButtonsSlot: () => TemplateResult | typeof nothing;
  renderCitationsSlot: () => TemplateResult | typeof nothing;
  onToggle: (checked: boolean) => void;
  onRetry: () => void;
  onClickShowButton: () => void;
}

/**
 * Renders the main content of the generated answer including header, toggle, answer text, and citations.
 */
export const renderAnswerContent: FunctionalComponent<
  RenderAnswerContentProps
> = ({props}) => {
  const {
    i18n,
    generatedAnswerState,
    isAnswerVisible,
    hasRetryableError,
    toggleTooltip,
    withToggle,
    collapsible,
    question,
    renderFeedbackAndCopyButtonsSlot,
    renderCitationsSlot,
    onToggle,
    onRetry,
    onClickShowButton,
  } = props;

  const {isStreaming, answer, citations, answerContentFormat, expanded} =
    generatedAnswerState ?? {};
  const isExpanded = collapsible ? expanded : true;
  const currentQuestion = question.trim();

  return html`
    <div part="generated-content">
      <div part="header" class="flex items-center ${isAnswerVisible ? 'border-b-1 border-gray-200' : ''} px-6 py-3">
        <atomic-icon
          part="header-icon"
          class="text-primary h-4 w-4 fill-current"
          .icon=${'assets://sparkles.svg'}>
        </atomic-icon>
        ${renderHeading({
          props: {
            level: 0,
            part: 'header-label',
            class:
              'text-primary inline-block rounded-md px-2.5 py-2 font-medium',
          },
        })(html`${i18n.t('generated-answer-title')}`)}
        <div class="ml-auto flex h-9 items-center">
          ${renderSwitch({
            props: {
              part: 'toggle',
              checked: isAnswerVisible,
              onToggle,
              ariaLabel: i18n.t('generated-answer-title'),
              title: toggleTooltip,
              withToggle,
              tabIndex: 0,
            },
          })}
        </div>
      </div>
      ${when(
        isAnswerVisible,
        () => html`
          <div part="generated-content-container" class="px-6 pb-6">
            <div class="mt-6 flex gap-3">
              <p
                class="question-text min-w-0 flex-1 text-base font-semibold leading-6">
                ${currentQuestion}
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
                    ${renderGeneratingAnswerLabel({props: {i18n, isStreaming: !!isStreaming, collapsible}})}
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
                    <div class="flex justify-end">
                      ${renderDisclaimer({props: {i18n, isStreaming: !!isStreaming}})}
                    </div>
                  </div>
                `
                : nothing
            }
          </div>
        `,
        () => nothing
      )}
    </div>
  `;
};
