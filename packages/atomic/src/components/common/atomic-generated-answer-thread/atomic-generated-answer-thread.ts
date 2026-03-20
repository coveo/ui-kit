import type {GeneratedAnswerCitation} from '@coveo/headless';
import {
  html,
  LitElement,
  type nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import '@/src/components/common/atomic-generated-answer-content/atomic-generated-answer-content';
import '@/src/components/common/atomic-generated-answer-thread-item/atomic-generated-answer-thread-item';
import type {i18n} from 'i18next';
import type {GeneratedAnswer} from '@/src/components/common/atomic-generated-answer-content/atomic-generated-answer-content';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

const MIN_ANSWERS_TO_COLLAPSE = 2;

/**
 * The `atomic-generated-answer-thread` component is responsible for rendering a thread of generated answers.
 * @internal
 */
@customElement('atomic-generated-answer-thread')
@withTailwindStyles
export class AtomicGeneratedAnswerThread extends LitElement {
  /**
   * The list of generated answers to render in the thread.
   */
  @property({attribute: false})
  generatedAnswers: GeneratedAnswer[] = [];
  /**
   * The i18next instance used to translate UI labels.
   */
  @property({attribute: false})
  public i18n!: i18n;

  /**
   * A render function responsible for displaying the citations of a single answer.
   */
  @property({attribute: false})
  public renderCitations: (
    citations: GeneratedAnswerCitation[],
    answerId?: string
  ) => TemplateResult | typeof nothing = () => html``;

  /**
   * Callback invoked when the user clicks the "like" feedback button of a specific answer.
   */
  @property({attribute: false})
  public onClickLike: (answerId: string) => void = () => {};

  /**
   * Callback invoked when the user clicks the "dislike" feedback button of a specific answer.
   */
  @property({attribute: false})
  public onClickDislike: (answerId: string) => void = () => {};

  /**
   * Callback invoked after the text of a specific answer has been successfully copied.
   */
  @property({attribute: false})
  public onCopyToClipboard: (answerId: string) => void = () => {};

  @state()
  private allGeneratedAnswersDisplayed: boolean = false;

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('generatedAnswers')) {
      const oldValue = changedProperties.get('generatedAnswers');
      const newValue = this.generatedAnswers;
      if (oldValue?.length !== newValue?.length) {
        this.allGeneratedAnswersDisplayed = false;
      }
    }
  }

  public render() {
    if (
      this.generatedAnswers.length > MIN_ANSWERS_TO_COLLAPSE &&
      !this.allGeneratedAnswersDisplayed
    ) {
      const lastGeneratedAnswer =
        this.generatedAnswers[this.generatedAnswers.length - 1];

      return html`
        <ul class="mt-6">
          ${this.renderShowPreviousAnswersButton()}
          ${this.renderThread([lastGeneratedAnswer])}
        </ul>
      `;
    }
    return html`
      <ul class="mt-6">
        ${this.renderThread(this.generatedAnswers)}
      </ul>
    `;
  }

  private renderThread(generatedAnswers: readonly GeneratedAnswer[]) {
    return html`
      ${repeat(
        generatedAnswers,
        (answer) => answer.answerId,
        (answer, index) => {
          const isLastAnswer = index === generatedAnswers.length - 1;

          return html`
            <atomic-generated-answer-thread-item
              .title=${answer.question}
              .hideLine=${isLastAnswer}
              .disableCollapse=${isLastAnswer}
              .isExpanded=${isLastAnswer}
            >
              <atomic-generated-answer-content
                .generatedAnswer=${answer}
                .i18n=${this.i18n}
                .renderCitations=${this.renderCitations}
                .onClickLike=${this.onClickLike}
                .onClickDislike=${this.onClickDislike}
                .onCopyToClipboard=${this.onCopyToClipboard}
              ></atomic-generated-answer-content>
            </atomic-generated-answer-thread-item>
          `;
        }
      )}
    `;
  }

  private handleShowAllClick() {
    this.allGeneratedAnswersDisplayed = true;
  }

  private renderShowPreviousAnswersButton() {
    const label =
      this.i18n?.t?.('show-previous-questions', {
        count: this.generatedAnswers.length - 1,
      }) ?? 'Show previous questions';

    const showPreviousButtonClasses = `
      text-on-background text-base min-w-0 inline-flex text-left mr-auto
      px-2 py-1.5 font-normal bg-transparent border-0 appearance-none
      transition-colors hover:bg-neutral-light rounded-md cursor-pointer
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-primary focus-visible:ring-offset-2
    `;
    const timelineDotClasses = `
      h-2 w-2 rounded-full bg-neutral-dim
    `;
    const timelineConnectorClasses = `
      relative h-full w-px bg-neutral
      before:absolute before:left-0 before:top-[-8px]
      before:h-[8px] before:w-px before:bg-neutral before:content-['']
      after:absolute after:bottom-[-8px] after:left-0
      after:h-[8px] after:w-px after:bg-neutral after:content-['']
    `;

    return html`
      <li class="grid min-w-0">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex w-[10px] shrink-0 items-center justify-center">
            <span class=${timelineDotClasses}></span>
          </div>
          <div class="flex min-w-0 flex-col">
            <button
              type="button"
              class=${showPreviousButtonClasses}
              @click=${this.handleShowAllClick}
            >
              ${label}
            </button>
          </div>
        </div>
        <div class="flex h-3 w-[10px] shrink-0 justify-center">
          <span class=${timelineConnectorClasses}> </span>
        </div>
      </li>
    `;
  }
}
