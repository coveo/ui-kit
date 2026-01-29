import type {
  GeneratedAnswerCitation,
  GeneratedAnswerState,
} from '@coveo/headless';
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
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';
import '@/src/components/common/atomic-icon/atomic-icon';
import '@/src/components/search/atomic-previous-answers-list/atomic-previous-answers-list';

const getShowPreviousQuestionsLabel = (translator: i18n, count: number) => {
  if (!count) {
    return '';
  }
  const fallback = `Show ${count} previous question${count === 1 ? '' : 's'}`;
  return translator.t('show-previous-questions', {
    count,
    defaultValue: fallback,
  });
};

interface FollowUpAnswerForRendering {
  question: string;
  answer?: string;
  answerContentFormat?: string;
  citations?: GeneratedAnswerCitation[];
  isStreaming?: boolean;
}

export interface RenderAnswerContentProps {
  i18n: i18n;
  generatedAnswerState: GeneratedAnswerState | undefined;
  query: string;
  initialQuery: string;
  isAnswerVisible: boolean;
  hasRetryableError: boolean;
  toggleTooltip: string;
  withToggle: boolean;
  collapsible: boolean;
  scrollable?: boolean;
  previousAnswersCollapsed?: boolean;
  agentId?: string;
  followUpAnswers?: {
    id: string;
    isEnabled: boolean;
    canAskMore: boolean;
    answers: FollowUpAnswerForRendering[];
  };
  renderFeedbackAndCopyButtonsSlot: () => TemplateResult | typeof nothing;
  renderCitationsSlot: () => TemplateResult | typeof nothing;
  onToggle: (checked: boolean) => void;
  onRetry: () => void;
  onClickShowButton: () => void;
  onTogglePreviousAnswers?: () => void;
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
    scrollable = false,
    previousAnswersCollapsed = false,
    query,
    initialQuery,
    agentId,
    followUpAnswers,
    renderFeedbackAndCopyButtonsSlot,
    renderCitationsSlot,
    onToggle,
    onRetry,
    onClickShowButton,
    onTogglePreviousAnswers,
  } = props;

  // Determine which answer to display
  const hasFollowUps = !!agentId && !!followUpAnswers?.answers?.length;
  const latestAnswer = hasFollowUps
    ? followUpAnswers!.answers[followUpAnswers!.answers.length - 1]
    : null;

  // If there are follow-ups, display the latest follow-up answer
  // Otherwise display the initial answer
  const displayState = latestAnswer || generatedAnswerState;
  const displayQuery = latestAnswer?.question || query.trim();

  // For the accordion, show all previous answers (initial + older follow-ups)
  // excluding the latest one
  const initialQuestion = (initialQuery || query).trim();
  const previousAnswers = hasFollowUps
    ? [
        ...(generatedAnswerState
          ? [{...generatedAnswerState, question: initialQuestion}]
          : []),
        ...followUpAnswers!.answers.slice(0, -1),
      ]
    : [];

  const showPreviousQuestionsLabel = getShowPreviousQuestionsLabel(
    i18n,
    previousAnswers.length
  );

  const queryRowSpacingClass = previousAnswers.length > 0 ? 'py-2' : 'mt-3';

  const {isStreaming, answer, citations, answerContentFormat} =
    displayState ?? {};

  // The "expanded" state is a UI concern owned by the main generated answer state.
  // Follow-up answers don't carry this flag.
  const expanded = generatedAnswerState?.expanded;
  const isExpanded = collapsible ? (expanded ?? true) : true;
  const showInlineActions = !hasRetryableError && isExpanded;

  return html`
    <div part="generated-content">
      <div
        part="header"
        class="flex items-center ${
          isAnswerVisible ? 'border-b-1 border-gray-200' : ''
        } px-6 py-2"
      >
        <atomic-icon
          part="header-icon"
          class="text-primary h-4 w-4 fill-current"
          .icon=${'assets://sparkles.svg'}
        >
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
        () => {
          const contentClasses = scrollable
            ? 'overflow-y-auto max-h-[500px]'
            : '';
          return html`
            <div class="${contentClasses}">
              ${
                previousAnswersCollapsed && showPreviousQuestionsLabel
                  ? html`
                    <div class="px-6 pt-6 pb-3">
                      <div class="flex gap-4">
                        <div class="flex items-center">
                          <span
                            class="w-2.5 h-2.5 rounded-full bg-neutral-dark/30"
                          ></span>
                        </div>
                        <div>
                          <button
                            @click=${onTogglePreviousAnswers}
                            class="px-2 py-1 text-sm font-medium text-neutral-dark bg-gray-100 rounded-md border border-gray-100 shadow-inner transition-colors hover:bg-gray-100/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            type="button"
                          >
                            ${showPreviousQuestionsLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                  : nothing
              }
              ${
                previousAnswers.length > 0 && !previousAnswersCollapsed
                  ? html`
                    <atomic-previous-answers-list
                      .previousAnswers=${previousAnswers}
                      .i18n=${i18n}
                      .renderFeedbackAndCopyButtonsSlot=${renderFeedbackAndCopyButtonsSlot}
                      .renderCitationsSlot=${renderCitationsSlot}
                    ></atomic-previous-answers-list>
                  `
                  : nothing
              }
              <div part="generated-content-container" class="px-6 pb-6">
                <div
                  class=${`flex items-center justify-between gap-3 ${queryRowSpacingClass}`}
                >
                  <div
                    class=${`flex ${previousAnswers.length > 0 ? 'gap-4' : ''}`}
                  >
                    ${
                      previousAnswers.length > 0
                        ? html`
                          <div class="flex items-center">
                            <span
                              class="w-2.5 h-2.5 rounded-full bg-neutral-dark/30"
                            ></span>
                          </div>
                        `
                        : nothing
                    }
                    <p class="query-text text-base font-semibold leading-6">
                      ${displayQuery}
                    </p>
                  </div>
                  ${when(
                    showInlineActions,
                    () => html`
                      <div class="flex items-center gap-2 h-9">
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
                          containerClass:
                            previousAnswers.length > 0 ? 'px-6' : undefined,
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
                          props: {
                            i18n,
                            isStreaming: !!isStreaming,
                            collapsible,
                          },
                        })}
                        ${
                          collapsible && !isStreaming
                            ? renderShowButton({
                                props: {
                                  i18n,
                                  onClick: onClickShowButton,
                                  isCollapsed: !(expanded ?? true),
                                },
                              })
                            : nothing
                        }
                      </div>
                    `
                    : nothing
                }
              </div>
            </div>
          `;
        },
        () => nothing
      )}
    </div>
  `;
};
