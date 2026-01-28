import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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
   * Set of indices for expanded answer content.
   */
  @state()
  private expandedAnswers: Set<number> = new Set();

  /**
   * Whether to show all previous questions or just the collapsed state.
   */
  @state()
  private showAllPrevious = true;

  private toggleAnswerExpansion(index: number) {
    const newSet = new Set(this.expandedAnswers);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    this.expandedAnswers = newSet;
  }

  private toggleShowPrevious() {
    this.showAllPrevious = !this.showAllPrevious;
  }

  private renderAnswerContent(answer: PreviousAnswer): TemplateResult {
    const {
      answer: answerText,
      answerContentFormat,
      citations,
      isStreaming,
    } = answer;

    console.log('ANSWER CONTENT FORMAT: ', answerContentFormat);

    return html`
      <div part="generated-content-container" class="px-6 pb-6">
        ${renderGeneratedContentContainer({
          props: {
            answer: answerText,
            answerContentFormat: 'text/markdown',
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

  private renderAnswer(answer: PreviousAnswer, index: number) {
    const isExpanded = this.expandedAnswers.has(index);

    return html`
      <div class="" part="previous-answer-item">
        <button
          type="button"
          @click=${() => this.toggleAnswerExpansion(index)}
          class="group w-full px-6 py-3 text-left bg-white transition-colors flex align-center items-center justify-between gap-3"
          aria-expanded=${isExpanded}
          part="previous-answer-question"
        >
          <p class="query-text text-base font-semibold leading-6 group-hover:bg-gray-100 rounded transition-colors self-center">
            ${answer.question}
          </p>
          ${
            isExpanded
              ? html`
            <div class="flex items-center gap-2 h-9">
              ${this.renderFeedbackAndCopyButtonsSlot?.() || nothing}
            </div>
          `
              : nothing
          }
        </button>

        ${
          isExpanded
            ? html`
          <div class="bg-white" part="previous-answer-content">
            ${this.renderAnswerContent(answer)}
          </div>
        `
            : nothing
        }
      </div>
    `;
  }

  private renderShowPreviousButton() {
    if (!this.previousAnswers.length) {
      return nothing;
    }

    const previousCount = this.previousAnswers.length;
    const buttonText = this.showAllPrevious
      ? 'Hide previous questions'
      : `Show ${previousCount} previous question${previousCount > 1 ? 's' : ''}`;

    return html`
      <button
        type="button"
        @click=${this.toggleShowPrevious}
        class="w-full px-6 py-3 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
        part="show-previous-button"
      >
        ${buttonText}
      </button>
    `;
  }

  render() {
    if (!this.previousAnswers.length) {
      return nothing;
    }

    return html`
      <div class="bg-white" part="previous-answers-container">
        ${this.renderShowPreviousButton()}
        ${
          this.showAllPrevious
            ? html`
          ${this.previousAnswers.map((answer, index) =>
            this.renderAnswer(answer, index)
          )}
        `
            : nothing
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-previous-answers-list': AtomicPreviousAnswersList;
  }
}
