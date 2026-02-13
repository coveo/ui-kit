import type {
  GeneratedAnswerBase,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import {html, LitElement, type PropertyValues, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/search/generated-answer-thread-item/generated-answer-thread-item';
import '@/src/components/common/generated-answer/answer-content/answer-content';
import type {i18n} from 'i18next';
import {classMap} from 'lit-html/directives/class-map.js';

export interface GeneratedAnswer extends GeneratedAnswerBase {
  question: string;
  expanded?: boolean;
}

@customElement('generated-answers-thread')
@withTailwindStyles
export class GeneratedAnswersThread extends LitElement {
  @property({attribute: false})
  generatedAnswers: GeneratedAnswer[] = [];
  @property({attribute: false})
  i18n: i18n = {} as i18n;
  @property({attribute: false})
  renderCitations: (citations: GeneratedAnswerCitation[]) => TemplateResult =
    () => html``;
  @property({attribute: false})
  onClickLike: (answerId: string) => void = () => {};
  @property({attribute: false})
  onClickDislike: (answerId: string) => void = () => {};
  @property({attribute: false})
  onCopyToClipboard: (answerId: string) => void = () => {};

  @state()
  private allGeneratedAnswerDisplayed: boolean = false;

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('generatedAnswers')) {
      const oldValue = changedProperties.get('generatedAnswers');
      const newValue = this.generatedAnswers;
      if (oldValue?.length !== newValue?.length) {
        this.allGeneratedAnswerDisplayed = false;
      }
    }
  }

  public render() {
    if (this.generatedAnswers.length > 1 && !this.allGeneratedAnswerDisplayed) {
      const lastGeneratedAnswer =
        this.generatedAnswers[this.generatedAnswers.length - 1];

      return html`
        <div class="mt-6">
          ${this.renderShowPreviousAnswersButton()}
          ${this.renderThread([lastGeneratedAnswer])}
        </div>
      `;
    }
    return html`
      <div class="mt-6">${this.renderThread(this.generatedAnswers)}</div>
    `;
  }

  private showAllGeneratedAnswer() {
    this.allGeneratedAnswerDisplayed = true;
  }

  private renderThread(generatedAnswers: GeneratedAnswer[]) {
    return html` ${generatedAnswers.map((answer) => {
      return html`<generated-answer-thread-item
        .title=${answer.question}
        .hideLine=${true}
        .isCollapsible=${false}
        .isExpanded=${true}
      >
        <answer-content
          .generatedAnswer=${answer}
          .i18n=${this.i18n}
          .renderCitations=${this.renderCitations}
          .onClickLike=${this.onClickLike}
          .onClickDislike=${this.onClickDislike}
          .onCopyToClipboard=${this.onCopyToClipboard}
        ></answer-content>
      </generated-answer-thread-item>`;
    })}`;
  }

  private renderShowPreviousAnswersButton() {
    const titleBaseClasses = {
      'text-on-background': true,
      'text-base': true,
      'min-w-0': true,
      'inline-flex': true,
      'text-left': true,
      'mr-auto': true,
    };
    const titleButtonClasses = classMap({
      ...titleBaseClasses,
      'font-normal': true,
      'bg-transparent': true,
      'border-0': true,
      'appearance-none': true,
      'ml-1': true,
      'px-2': true,
      'py-1.5': true,
      'transition-colors': true,
      'hover:bg-neutral-light': true,
      'rounded-md': true,
      'cursor-pointer': true,
      'focus-visible:outline-none': true,
      'focus-visible:ring-2': true,
      'focus-visible:ring-primary': true,
      'focus-visible:ring-offset-2': true,
    });

    const timelineDotClasses = classMap({
      'mt-3': true,
      'h-2': true,
      'w-2': true,
      'rounded-full': true,
      'bg-neutral-dim': true,
    });

    return html` <li class="grid grid-cols-[10px_1fr]">
      <div class="flex flex-col items-center row-span-2">
        <span class=${timelineDotClasses}></span>
        <span class="w-px bg-neutral flex-1"></span>
      </div>
      <div class="flex items-start">
        <div class="flex min-w-0 flex-col">
          <button
            type="button"
            class=${titleButtonClasses}
            @click=${this.showAllGeneratedAnswer}
          >
            Show all answers
          </button>
        </div>
      </div>
    </li>`;
  }
}
