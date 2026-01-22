import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-previous-answers-list` component displays previous follow-up questions and answers in an accordion format.
 * This is used within the multi-turn generated answer experience.
 *
 * @internal
 *
 * @part previous-answers-container - The container for all previous answers.
 * @part previous-answer-header - The clickable header for each accordion item.
 * @part previous-answer-label - The "Follow-up X" label.
 * @part previous-answer-question - The question text.
 * @part previous-answer-chevron - The expand/collapse chevron icon.
 * @part previous-answer-content - The answer content container.
 *
 * @slot default - Slot for rendering each answer. The component will pass answer data to child components.
 */
@customElement('atomic-previous-answers-list')
@withTailwindStyles
export class AtomicPreviousAnswersList extends LitElement {
  /**
   * The array of previous follow-up answers to display.
   */
  @property({type: Array})
  // biome-ignore lint/suspicious/noExplicitAny: POC
  answers: any[] = [];

  /**
   * Set of indices for expanded accordion items.
   */
  @state()
  private expandedIndices: Set<number> = new Set();

  connectedCallback() {
    super.connectedCallback();
    // Auto-expand the most recent answer
    if (this.answers.length > 0) {
      this.expandedIndices.add(this.answers.length - 1);
    }
  }

  private toggleExpansion(index: number) {
    const newSet = new Set(this.expandedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    this.expandedIndices = newSet;
  }

  // biome-ignore lint/suspicious/noExplicitAny: POC
  private renderAccordionItem(answer: any, index: number) {
    const isExpanded = this.expandedIndices.has(index);

    return html`
      <div class="border-b border-gray-200" part="previous-answer-item">
        <!-- Clickable header -->
        <button
          type="button"
          @click=${() => this.toggleExpansion(index)}
          class="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          aria-expanded=${isExpanded}
          part="previous-answer-header"
        >
          <div class="flex-1 min-w-0">
            <span class="block text-sm text-gray-500 mb-1" part="previous-answer-label">
              Follow-up ${index + 1}
            </span>
            <span class="block text-base font-semibold leading-6 truncate" part="previous-answer-question">
              ${answer.question}
            </span>
          </div>
          <svg
            class="h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}"
            viewBox="0 0 20 20"
            fill="currentColor"
            part="previous-answer-chevron"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Collapsible content -->
        ${isExpanded ? html`<div part="previous-answer-content"><slot></slot></div>` : nothing}
      </div>
    `;
  }

  render() {
    if (!this.answers.length) {
      return nothing;
    }

    return html`
      <div class="mt-4 border-t border-gray-200" part="previous-answers-container">
        ${this.answers.map((answer, index) => this.renderAccordionItem(answer, index))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-previous-answers-list': AtomicPreviousAnswersList;
  }
}
