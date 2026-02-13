import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/search/generated-answer-thread-item/generated-answer-thread-item';
import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {i18n} from 'i18next';
import atomicGeneratedAnswerStyles from '@/src/components/search/atomic-generated-answer/atomic-generated-answer.tw.css.js';
import type {GeneratedAnswer} from '../generated-answers-thread/generated-answers-thread';
import {renderGeneratedContentContainer} from '../generated-content-container';
import {renderFeedbackAndCopyButtons} from '../render-feedback-and-copy-buttons';
import {renderSourceCitations} from '../source-citations';

export interface AnswersContentProps {
  generatedAnswer: GeneratedAnswer;
}

@customElement('answer-content')
@withTailwindStyles
export class AnswerContent extends LitElement {
  static styles = [atomicGeneratedAnswerStyles];
  /**
   * The generated answer to display
   */
  @property({attribute: false})
  generatedAnswer: GeneratedAnswer | undefined = undefined;
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
  private copied: boolean = false;
  @state()
  private copyError: boolean = false;
  @state()
  private copyToClipboardTooltip: string = 'Copy to clipboard';

  public render() {
    const {
      answer,
      answerContentFormat,
      isStreaming,
      citations = [],
    } = this.generatedAnswer || {};

    if (!this.generatedAnswer) {
      return html``;
    }

    return html`
      <div>
        <div>
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
            })(html`${this.renderCitations(citations)}`)}`
          )}
        </div>

        <div class="mt-4">
          ${renderFeedbackAndCopyButtons({
            props: {
              i18n: this.i18n,
              generatedAnswerActionsState: this.generatedAnswer,
              copied: this.copied,
              copyError: this.copyError,
              getCopyToClipboardTooltip: () => this.copyToClipboardTooltip,
              onClickLike: () =>
                this.onClickLike(this.generatedAnswer?.answerId!),
              onClickDislike: () =>
                this.onClickDislike(this.generatedAnswer?.answerId!),
              onCopyToClipboard: () => this.copyToClipboard(),
            },
          })}
        </div>
      </div>
    `;
  }

  private async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.generatedAnswer?.answer!);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
      this.onCopyToClipboard(this.generatedAnswer?.answerId!);
    } catch (error) {
      this.copyError = true;
      setTimeout(() => {
        this.copyError = false;
      }, 2000);
      console.error(`Failed to copy to clipboard: ${error}`);
    }
  }
}
