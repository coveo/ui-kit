import type {
  GeneratedAnswerBase,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, LitElement, type nothing, type TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../accordion-item/accordion-item';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import atomicGeneratedAnswerStyles from '../../search/atomic-generated-answer/atomic-generated-answer.tw.css';
import {renderAnswerContent} from '../generated-answer/render-answer-content';

export interface GeneratedAnswer extends GeneratedAnswerBase {
  question: string;
  expanded?: boolean;
}

export interface GeneratedAnswersThreadProps {
  i18n: i18n;
  generatedAnswer: GeneratedAnswer[];
  renderFeedbackAndCopyButtonsSlot: () => TemplateResult | typeof nothing;
  renderCitationsSlot: (
    citations: GeneratedAnswerCitation[]
  ) => TemplateResult | typeof nothing;
  onRetry: () => void;
}

@customElement('generated-answers-thread')
@withTailwindStyles
export class GeneratedAnswersThread extends LitElement {
  static styles = [atomicGeneratedAnswerStyles];

  @property({attribute: false})
  i18n!: i18n;

  @property({attribute: false})
  generatedAnswers: GeneratedAnswer[] = [];

  @property({attribute: false})
  renderFeedbackAndCopyButtonsSlot!: (
    generatedAnswer: GeneratedAnswer
  ) => TemplateResult;

  @property({attribute: false})
  renderCitationsSlot!: (
    citations: GeneratedAnswerCitation[]
  ) => TemplateResult;

  @property({attribute: false})
  onRetry!: () => void;

  render() {
    return html`
      <div class="mt-6">
        ${this.generatedAnswers.map((answer, index) => {
          const isLast = index === this.generatedAnswers.length - 1;
          return html`<accordion-item
            .title=${answer.question}
            ?nonCollapsible=${isLast}
            ?hideTimeline=${isLast}
            ?expanded=${isLast}
          >
            ${renderAnswerContent({
              props: {
                i18n: this.i18n,
                generatedAnswer: answer,
                collapsible: false,
                renderFeedbackAndCopyButtonsSlot: () =>
                  this.renderFeedbackAndCopyButtonsSlot(answer),
                renderCitationsSlot: () =>
                  this.renderCitationsSlot(answer.citations),
                onRetry: this.onRetry,
                onClickShowButton: () => {},
              },
            })}
          </accordion-item>`;
        })}
      </div>
    `;
  }
}
