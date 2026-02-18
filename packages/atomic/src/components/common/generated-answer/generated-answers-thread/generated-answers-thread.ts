import type {
  GeneratedAnswerBase,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
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

  static styles = css`
    .item-header {
      display: flex;
    }

    .dot-container {
      width: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dot {
      border-radius: 50%;
      height: 8px;
      width: 8px;
      background: #adb5bd;
    }

    .item-title {
      margin-left: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      padding-right: 4px;
      padding-left: 4px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .hoverable:hover {
      background-color: #f3f3f3;
      border-radius: 8px;
    }

    .item-body {
      display: flex;
    }

    .line-container {
      width: 10px;
      display: flex;
      justify-content: center;
      flex-shrink: 0;
    }

    .line {
      width: 1px;
      background: #e5e5e5;
    }

    .item-content {
      margin-left: 12px;
      padding-bottom: 12px;
      padding-top: 8px;
    }
  `;

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
    if (this.generatedAnswers.length > 2 && !this.allGeneratedAnswerDisplayed) {
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
    return html` ${generatedAnswers.map((answer, index) => {
      const isLast = index === generatedAnswers.length - 1;
      return html`<generated-answer-thread-item
        .title=${answer.question}
        .hideLine=${isLast}
        .disableCollapse=${isLast}
        .isExpanded=${isLast}
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
      'h-2': true,
      'w-2': true,
      'rounded-full': true,
      'bg-neutral-dim': true,
    });

    return html` <li class="grid min-w-0">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex w-[10px] shrink-0 items-center justify-center">
          <span class=${timelineDotClasses}></span>
        </div>
        <div class="flex min-w-0 flex-col">
          <button
            type="button"
            class=${titleButtonClasses}
            @click=${this.showAllGeneratedAnswer}
          >
            Show all previous answers
          </button>
        </div>
      </div>
      <div class="flex min-w-0 gap-3">
        <div class="flex w-[10px] shrink-0 justify-center">
          <span
            class="relative w-px bg-neutral h-full
               before:content-['']
               before:absolute before:top-[-8px] before:left-0
               before:w-px before:h-[8px] before:bg-neutral
               after:content-['']
               after:absolute after:bottom-[-8px] after:left-0
               after:w-px after:h-[8px] after:bg-neutral"
          >
          </span>
        </div>
        <div class="pl-2 py-2 ml-1"></div>
      </div>
    </li>`;
  }
}
