import type {GeneratedAnswerCitation} from '@coveo/headless';
import {html, LitElement, type PropertyValues, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/common/generated-answer/generated-answer-thread-item/generated-answer-thread-item';
import '@/src/components/common/generated-answer/answerContent/answer-content';
import type {i18n} from 'i18next';
import {repeat} from 'lit/directives/repeat.js';
import type {GeneratedAnswer} from '@/src/components/common/generated-answer/answerContent/answer-content';

@customElement('generated-answers-thread')
@withTailwindStyles
export class GeneratedAnswersThread extends LitElement {
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
    citations: GeneratedAnswerCitation[]
  ) => TemplateResult = () => html``;

  /**
   * Callback invoked when the user clicks the "like" feedback button of a specific answer.
   */
  @property({attribute: false})
  public onClickLike: (answerId?: string) => void = () => {};

  /**
   * Callback invoked when the user clicks the "dislike" feedback button of a specific answer.
   */
  @property({attribute: false})
  public onClickDislike: (answerId?: string) => void = () => {};

  /**
   * Callback invoked after the text of a specific answer has been successfully copied.
   */
  @property({attribute: false})
  public onCopyToClipboard: (answerId?: string) => void = () => {};

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
      this.generatedAnswers.length > 1 &&
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
            <generated-answer-thread-item
              .title=${answer.question}
              .hideLine=${isLastAnswer}
              .disableCollapse=${isLastAnswer}
              .isExpanded=${isLastAnswer}
            >
              <answer-content
                .generatedAnswer=${answer}
                .i18n=${this.i18n}
                .renderCitations=${this.renderCitations}
                .onClickLike=${this.onClickLike}
                .onClickDislike=${this.onClickDislike}
                .onCopyToClipboard=${this.onCopyToClipboard}
              ></answer-content>
            </generated-answer-thread-item>
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
      this.i18n?.t?.('show-previous-answers') ?? 'Show previous answers';

    return html`
      <li class="grid grid-cols-[10px_1fr]">
        <div class="flex flex-col items-center row-span-2">
          <span class="mt-3 h-2 w-2 rounded-full bg-neutral-dim"></span>
          <span class="w-px bg-neutral flex-1"></span>
        </div>
        <div class="flex items-start">
          <div class="flex min-w-0 flex-col">
            <button
              type="button"
              class="text-on-background text-base min-w-0 inline-flex text-left mr-auto
                   font-normal bg-transparent border-0 appearance-none ml-1 px-2 py-1.5
                   transition-colors hover:bg-neutral-light rounded-md cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-primary focus-visible:ring-offset-2"
              @click=${this.handleShowAllClick}
            >
              ${label}
            </button>
          </div>
        </div>
      </li>
    `;
  }
}
