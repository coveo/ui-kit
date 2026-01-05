import type {GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {TemplateResult} from 'lit';
import {html, nothing} from 'lit';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderDisclaimer} from './render-disclaimer';
import {renderGeneratingAnswerLabel} from './render-generating-answer-label';

export interface RenderAnswerContentProps {
  i18n: i18n;
  generatedAnswerState: GeneratedAnswerState | undefined;
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
    renderFeedbackAndCopyButtonsSlot,
    renderCitationsSlot,
    onToggle,
    onRetry,
    onClickShowButton,
  } = props;

  const {isStreaming, answer, citations, answerContentFormat, expanded} =
    generatedAnswerState ?? {};

  return html`
    <div part="generated-content">
      <div class="flex items-center">
        ${renderHeading({
          props: {
            level: 0,
            part: 'header-label',
            class:
              'text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium',
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
      ${
        hasRetryableError && isAnswerVisible
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
        !hasRetryableError && isAnswerVisible
          ? renderGeneratedContentContainer({
              props: {
                answer,
                answerContentFormat,
                isStreaming: !!isStreaming,
              },
            })(html`
            ${renderFeedbackAndCopyButtonsSlot()}
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
        !hasRetryableError && isAnswerVisible
          ? html`
            <div part="generated-answer-footer" class="mt-6 flex justify-end">
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
              ${renderDisclaimer({props: {i18n, isStreaming: !!isStreaming}})}
            </div>
          `
          : nothing
      }
    </div>
  `;
};
