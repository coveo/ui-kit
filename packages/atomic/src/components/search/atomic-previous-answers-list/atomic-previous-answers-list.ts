import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {i18n} from 'i18next';
import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/common/generated-answer/generated-content/generated-markdown-content';
import '@/src/components/common/generated-answer/generated-content/generated-text-content';
import markdownStyles from '@/src/components/common/generated-answer/generated-content/generated-markdown-content.tw.css';

interface PreviousAnswer {
  question: string;
  answer?: string;
  answerContentFormat?: string;
  citations?: GeneratedAnswerCitation[];
  isStreaming?: boolean;
}

/**
 * The `atomic-previous-answers-list` component displays previous follow-up questions and answers in a collapsible format.
 * This is used within the multi-turn generated answer experience.
 *
 * @internal
 *
 * @part previous-answers-container - The container for all previous answers.
 * @part show-previous-button - The button to show/hide previous questions.
 * @part previous-answer-item - Each individual answer item.
 * @part previous-answer-question - The question text that can be clicked to expand.
 * @part previous-answer-toggle - The button toggling the answer visibility.
 * @part previous-answer-content - The answer content container.
 */
@customElement('atomic-previous-answers-list')
@withTailwindStyles
export class AtomicPreviousAnswersList extends LitElement {
  static styles = markdownStyles;

  /**
   * The array of previous answers to display.
   */
  @property({type: Array})
  previousAnswers: PreviousAnswer[] = [];

  /**
   * The i18n instance for translations.
   */
  @property({type: Object})
  i18n!: i18n;

  /**
   * Function to render feedback and copy buttons for each previous answer.
   */
  @property({type: Object})
  renderFeedbackAndCopyButtonsSlot?: () => TemplateResult | typeof nothing;

  /**
   * Function to render citations slot.
   */
  @property({type: Object})
  renderCitationsSlot?: () => TemplateResult | typeof nothing;

  /**
   * Whether to extend the timeline past the last answer to connect with following content.
   */
  @property({type: Boolean})
  connectToNext = false;

  @state()
  private expandedQuestions = new Set<number>();

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('previousAnswers')) {
      this.expandedQuestions = new Set<number>();
    }
  }

  private toggleQuestion(index: number) {
    const updated = new Set(this.expandedQuestions);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    this.expandedQuestions = updated;
  }

  private renderAnswerContent(answer: PreviousAnswer): TemplateResult {
    const {
      answer: answerText,
      answerContentFormat,
      citations,
      isStreaming,
    } = answer;

    return html`
      <div part="generated-content-container" class="pb-6 px-6">
        ${renderGeneratedContentContainer({
          props: {
            answer: answerText,
            answerContentFormat: answerContentFormat || 'text/markdown',
            isStreaming: !!isStreaming,
          },
        })(html`
          ${renderSourceCitations({
            props: {
              label: this.i18n.t('citations'),
              isVisible: !!citations?.length,
            },
          })(this.renderCitationsSlot?.() || nothing)}
        `)}
      </div>
    `;
  }

  private renderTimelineColumn(index: number) {
    const hasPrevious = index > 0;
    const hasNext =
      index < this.previousAnswers.length - 1 || this.connectToNext;
    const lineClass = (isVisible: boolean) =>
      `w-px bg-neutral-dark ${isVisible ? 'flex-1' : 'h-0'}`;
    return html`
      <div class="flex w-5 items-start justify-center self-stretch pt-1">
        <div class="flex h-full flex-col items-center">
          <span class=${lineClass(hasPrevious)}></span>
          <span class="w-2.5 h-2.5 rounded-full bg-neutral-dark"></span>
          <span class=${lineClass(hasNext)}></span>
        </div>
      </div>
    `;
  }

  private renderAnswer(answer: PreviousAnswer, index: number) {
    const isExpanded = this.expandedQuestions.has(index);
    const contentId = `previous-answer-content-${index}`;
    const questionClasses = `query-text text-base leading-6 ${
      isExpanded ? 'font-semibold' : 'font-medium'
    }`;

    return html`
      <div class="px-6 py-2" part="previous-answer-item">
        <div class="flex gap-4">
          ${this.renderTimelineColumn(index)}
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <button
                class="flex items-center gap-3 rounded-md text-left transition-colors hover:bg-neutral-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click=${() => this.toggleQuestion(index)}
                aria-controls=${contentId}
                part="previous-answer-toggle"
                type="button"
              >
                <p class="${questionClasses}" part="previous-answer-question">
                  ${answer.question}
                </p>
              </button>
              ${when(
                isExpanded,
                () => html`
                  <div class="flex items-center gap-2 h-9">
                    ${this.renderFeedbackAndCopyButtonsSlot?.() || nothing}
                  </div>
                `,
                () => nothing
              )}
            </div>
            ${
              isExpanded
                ? html`
                    <div id=${contentId} class="mt-4" part="previous-answer-content">
                      ${this.renderAnswerContent(answer)}
                    </div>
                  `
                : nothing
            }
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.previousAnswers.length) {
      return nothing;
    }

    return html`
      <div
        class="bg-white flex flex-col mt-6"
        part="previous-answers-container"
      >
        ${this.previousAnswers.map((answer, index) =>
          this.renderAnswer(answer, index)
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-previous-answers-list': AtomicPreviousAnswersList;
  }
}
