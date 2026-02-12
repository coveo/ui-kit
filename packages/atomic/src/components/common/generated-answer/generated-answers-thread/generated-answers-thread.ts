import type {GeneratedAnswerBase} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/search/atomic-answers-thread-item/atomic-answers-thread-item';

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

  public render() {
    return html`
      <div class="mt-6">
        ${this.generatedAnswers.map((answer, index) => {
          const isLast = index === this.generatedAnswers.length - 1;
          return html`<atomic-answers-thread-item
            .title=${answer.question}
            .hideLine=${isLast}
            .isCollapsible=${!isLast}
            .isExpanded=${isLast}
          >
            ${answer.answer}
          </atomic-answers-thread-item>`;
        })}
      </div>
    `;
  }
}
