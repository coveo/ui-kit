import type {
  GeneratedAnswerBase,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/search/generated-answer-thread-item/generated-answer-thread-item';
import '@/src/components/common/generated-answer/answer-content/answer-content';
import type {i18n} from 'i18next';

export interface GeneratedAnswer extends GeneratedAnswerBase {
  question: string;
  expanded?: boolean;
}

export interface GeneratedAnswersThreadProps {
  generatedAnswers: GeneratedAnswer[];
}

@customElement('generated-answers-thread')
@withTailwindStyles
export class GeneratedAnswersThread extends LitElement {
  /**
   * The generated answers to display in the thread.
   */
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

  public render() {
    return html`
      <div class="mt-6">
        ${this.generatedAnswers.map((answer, index) => {
          const isLast = index === this.generatedAnswers.length - 1;
          return html`<generated-answer-thread-item
            .title=${answer.question}
            .hideLine=${isLast}
            .isCollapsible=${!isLast}
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
        })}
      </div>
    `;
  }
}
