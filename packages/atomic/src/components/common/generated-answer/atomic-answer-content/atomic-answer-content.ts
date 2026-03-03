import type {
  GeneratedAnswerBase,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, LitElement, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import atomicGeneratedAnswerStyles from '@/src/components/search/atomic-generated-answer/atomic-generated-answer.tw.css.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {renderGeneratedContentContainer} from '../generated-content-container';
import {renderAgentGenerationSteps} from '../render-agent-generation-steps';
import {renderFeedbackAndCopyButtons} from '../render-feedback-and-copy-buttons';
import {renderSourceCitations} from '../source-citations';

const COPY_RESET_DURATION_MS = 2000;

export interface GeneratedAnswer extends GeneratedAnswerBase {
  question: string;
  expanded?: boolean;
}

type CopyState = 'idle' | 'success' | 'error';

/**
 * The `atomic-answer-content` component renders the content of a generated answer.
 *
 * @internal
 */
@customElement('atomic-answer-content')
@withTailwindStyles
export class AtomicAnswerContent extends LitElement {
  static styles = [atomicGeneratedAnswerStyles];

  /**
   * The generated answer object to render.
   */
  @property({attribute: false})
  public generatedAnswer!: GeneratedAnswer;

  /**
   * The i18next instance used to translate UI labels.
   */
  @property({attribute: false})
  public i18n!: i18n;

  /**
   * A render function responsible for displaying the answer citations.
   */
  @property({attribute: false})
  public renderCitations: (
    citations: GeneratedAnswerCitation[]
  ) => TemplateResult = () => html``;

  /**
   * Callback invoked when the user clicks the "like" feedback button.
   */
  @property({attribute: false})
  public onClickLike: (answerId: string) => void = () => {};

  /**
   * Callback invoked when the user clicks the "dislike" feedback button.
   */
  @property({attribute: false})
  public onClickDislike: (answerId: string) => void = () => {};

  /**
   * Callback invoked after the answer text has been successfully copied.
   */
  @property({attribute: false})
  public onCopyToClipboard: (answerId: string) => void = () => {};

  /**
   * Internal copy feedback state.
   */
  @state()
  private copyState: CopyState = 'idle';

  private resetCopyTimeout?: number;

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.resetCopyTimeout);
  }

  public render() {
    const {
      answer,
      answerContentFormat,
      isStreaming,
      generationSteps,
      citations = [],
      answerId,
      error,
    } = this.generatedAnswer || {};

    if (error) {
      return this.renderError();
    }

    if (!answerId) {
      return html``;
    }

    return html`
      <div>
        ${renderAgentGenerationSteps({
          props: {
            i18n: this.i18n,
            agentSteps: generationSteps ?? [],
            isStreaming: Boolean(isStreaming),
          },
        })}
        <div>
          ${renderGeneratedContentContainer({
            props: {
              answer,
              answerContentFormat,
              isStreaming: Boolean(isStreaming),
            },
          })(html`
            ${renderSourceCitations({
              props: {
                label: this.i18n.t('citations'),
                isVisible: citations.length > 0,
              },
            })(html`${this.renderCitations(citations)}`)}
          `)}
        </div>
        ${this.renderFeedbackAndCopyButtons(answerId)}
      </div>
    `;
  }

  private renderFeedbackAndCopyButtons(answerId: string) {
    return html`
      <div class="mt-4" part="feedback-and-copy-buttons">
        ${renderFeedbackAndCopyButtons({
          props: {
            i18n: this.i18n,
            generatedAnswerActionsState: {
              liked: this.generatedAnswer.liked,
              disliked: this.generatedAnswer.disliked,
              isStreaming: this.generatedAnswer.isStreaming,
              isLoading: this.generatedAnswer.isLoading,
              answer: this.generatedAnswer.answer,
            },
            copied: this.copyState === 'success',
            copyError: this.copyState === 'error',
            getCopyToClipboardTooltip: () => this.getCopyToClipboardTooltip(),
            onClickLike: () => this.onClickLike(answerId),
            onClickDislike: () => this.onClickDislike(answerId),
            onCopyToClipboard: () => this.copyToClipboard(),
          },
        })}
      </div>
    `;
  }

  private async copyToClipboard(): Promise<void> {
    const {answer, answerId} = this.generatedAnswer;

    if (!answer || !answerId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(answer);
      this.copyState = 'success';
      this.onCopyToClipboard(answerId);
    } catch (error) {
      this.copyState = 'error';
      console.error(`Failed to copy to clipboard: ${error}`);
    }

    this.scheduleCopyReset();
  }

  private scheduleCopyReset() {
    clearTimeout(this.resetCopyTimeout);
    this.resetCopyTimeout = window.setTimeout(() => {
      this.copyState = 'idle';
    }, COPY_RESET_DURATION_MS);
  }

  private getCopyToClipboardTooltip(): string {
    switch (this.copyState) {
      case 'error':
        return this.i18n.t('failed-to-copy-generated-answer');
      case 'success':
        return this.i18n.t('generated-answer-copied');
      default:
        return this.i18n.t('copy-generated-answer');
    }
  }

  private renderError(): TemplateResult {
    return html`
      <div part="generated-answer-error">
        <p>
          ${this.i18n.t('generated-answer-error-generic')}
        </p>
      </div>
    `;
  }
}
