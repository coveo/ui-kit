import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/search/generated-answer-thread-item/generated-answer-thread-item';
import type {i18n} from 'i18next';
import type {GeneratedAnswer} from '../generated-answers-thread/generated-answers-thread';
import {renderGeneratedContentContainer} from '../generated-content-container';
import {renderSourceCitations} from '../source-citations';

export interface AnswersContentProps {
  generatedAnswer: GeneratedAnswer;
}

@customElement('answer-content')
@withTailwindStyles
export class AnswerContent extends LitElement {
  /**
   * The generated answer to display
   */
  @property({attribute: false})
  generatedAnswer: GeneratedAnswer | undefined = undefined;
  @property({attribute: false})
  i18n: i18n = {} as i18n;

  public render() {
    const {answer, answerContentFormat, isStreaming, citations} =
      this.generatedAnswer || {};

    return html`
      <div class="mt-6">
        ${renderGeneratedContentContainer({
          props: {
            answer,
            answerContentFormat,
            isStreaming: !!isStreaming,
          },
        })(
          html` ${renderSourceCitations({
            props: {
              label: this.i18n?.t('citations'),
              isVisible: !!citations?.length,
            },
          })(html``)}`
        )}
      </div>
    `;
  }
}
