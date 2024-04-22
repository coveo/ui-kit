import {
  GeneratedAnswer,
  GeneratedAnswerCitation,
  GeneratedAnswerState,
  GeneratedAnswerStyle,
  InteractiveCitation,
  InteractiveCitationProps,
  SearchStatusState,
} from '@coveo/headless';
import {h} from '@stencil/core';
import {
  GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {Heading} from '../heading';
import {AnyBindings} from '../interface/bindings';
import {Switch} from '../switch';
import {CopyButton} from './copy-button';
import {FeedbackButton} from './feedback-button';
import {GeneratedContentContainer} from './generated-content-container';
import {RephraseButtons} from './rephrase-buttons';
import {RetryPrompt} from './retry-prompt';
import {SourceCitations} from './source-citations';
import {TypingLoader} from './typing-loader';

interface GeneratedAnswerCommonOptions {
  host: HTMLElement;
  getGeneratedAnswer: () => GeneratedAnswer | undefined;
  getGeneratedAnswerState: () => GeneratedAnswerState | undefined;
  getSearchStatusState: () => SearchStatusState | undefined;
  getBindings: () => AnyBindings;
  getCopied: () => boolean;
  setCopied: (isCopied: boolean) => void;
  getCopyError: () => boolean;
  setCopyError: (copyError: boolean) => void;
  setAriaMessage: (message: string) => void;
  buildInteractiveCitation: (
    props: InteractiveCitationProps
  ) => InteractiveCitation;
}

export class GeneratedAnswerCommon {
  private storage: SafeStorage = new SafeStorage();
  private _data: GeneratedAnswerData;
  private modalRef?: HTMLAtomicGeneratedAnswerFeedbackModalElement;

  private contentClasses =
    'mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';
  private loadingClasses = 'my-3';

  constructor(private props: GeneratedAnswerCommonOptions) {
    this._data = this.readStoredData();
  }

  public insertFeedbackModal() {
    this.modalRef = document.createElement(
      'atomic-generated-answer-feedback-modal'
    );
    this.modalRef.generatedAnswer = this.props.getGeneratedAnswer()!;
    this.props.host.insertAdjacentElement('beforebegin', this.modalRef);
  }

  public readStoredData(): GeneratedAnswerData {
    return this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );
  }

  public writeStoredData(data: GeneratedAnswerData) {
    this.storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
  }

  get data() {
    return this._data;
  }

  set data(newData: GeneratedAnswerData) {
    this._data = newData;
  }

  public getGeneratedAnswerStatus() {
    const isHidden = !this.props.getGeneratedAnswerState()?.isVisible;
    const isGenerating = !!this.props.getGeneratedAnswerState()?.isStreaming;
    const hasAnswer = !!this.props.getGeneratedAnswerState()?.answer;
    const hasError = !!this.props.getGeneratedAnswerState()?.error;

    if (isHidden) {
      return this.props.getBindings().i18n.t('generated-answer-hidden');
    }

    if (isGenerating) {
      return this.props.getBindings().i18n.t('generating-answer');
    }

    if (hasError) {
      return this.props.getBindings().i18n.t('answer-could-not-be-generated');
    }

    if (hasAnswer) {
      return this.props.getBindings().i18n.t('answer-generated', {
        answer: this.props.getGeneratedAnswerState()?.answer,
      });
    }

    return '';
  }

  private get hasRetryableError() {
    return (
      !this.props.getSearchStatusState()?.hasError &&
      this.props.getGeneratedAnswerState()?.error?.isRetryable
    );
  }

  private get shouldBeHidden() {
    const {isLoading, answer, citations} =
      this.props.getGeneratedAnswerState() ?? {};
    return (
      !(isLoading || answer !== undefined || citations?.length) &&
      !this.hasRetryableError
    );
  }

  private get isAnswerVisible() {
    return this.props.getGeneratedAnswerState()?.isVisible;
  }

  private get toggleTooltip() {
    const key = this.isAnswerVisible
      ? 'generated-answer-toggle-on'
      : 'generated-answer-toggle-off';
    return this.props.getBindings().i18n.t(key);
  }

  private get hasClipboard() {
    return !!navigator?.clipboard?.writeText;
  }

  private get copyToClipboardTooltip() {
    if (this.props.getCopyError()) {
      return this.props.getBindings().i18n.t('failed-to-copy-generated-answer');
    }

    return !this.props.getCopied()
      ? this.props.getBindings().i18n.t('copy-generated-answer')
      : this.props.getBindings().i18n.t('generated-answer-copied');
  }

  private async copyToClipboard(answer: string) {
    try {
      await navigator.clipboard.writeText(answer);
      this.props.setCopied(true);
      this.props.getGeneratedAnswer()?.logCopyToClipboard();
    } catch (error) {
      this.props.setCopyError(true);
      this.props
        .getBindings()
        .engine.logger.error(`Failed to copy to clipboard: ${error}`);
    }

    setTimeout(() => {
      this.props.setCopied(false);
      this.props.setCopyError(false);
    }, 2000);
  }

  private renderCitations() {
    return this.props
      .getGeneratedAnswerState()
      ?.citations.map((citation: GeneratedAnswerCitation, index: number) => {
        const interactiveCitation = this.props.buildInteractiveCitation({
          options: {
            citation,
          },
        });
        return (
          <li key={citation.id} class="max-w-full">
            <atomic-citation
              citation={citation}
              index={index}
              sendHoverEndEvent={(citationHoverTimeMs: number) => {
                this.props
                  .getGeneratedAnswer()
                  ?.logCitationHover(citation.id, citationHoverTimeMs);
              }}
              interactiveCitation={interactiveCitation}
              exportparts="citation,citation-popover"
            />
          </li>
        );
      });
  }

  private clickDislike() {
    if (
      this.modalRef &&
      !this.props.getGeneratedAnswerState()?.feedbackSubmitted
    ) {
      this.modalRef.isOpen = true;
    }
    this.props.getGeneratedAnswer()?.dislike();
  }

  private onChangeAnswerStyle(answerStyle: GeneratedAnswerStyle) {
    if (
      this.props.getGeneratedAnswerState()?.responseFormat.answerStyle !==
      answerStyle
    ) {
      this.props.getGeneratedAnswer()?.rephrase({answerStyle});
    }
  }

  private renderContent() {
    return (
      <div part="generated-content">
        <div class="flex items-center">
          <Heading
            level={0}
            part="header-label"
            class="text-bg-primary font-medium inline-block rounded-md py-2 px-2.5"
          >
            {this.props.getBindings().i18n.t('generated-answer-title')}
          </Heading>
          <div class="flex gap-2 h-9 items-center ml-auto">
            {!this.hasRetryableError &&
              !this.props.getGeneratedAnswerState()?.isStreaming &&
              this.isAnswerVisible && (
                <div class="feedback-buttons flex shrink-0 gap-2 ml-auto">
                  <FeedbackButton
                    title={this.props
                      .getBindings()
                      .i18n.t('this-answer-was-helpful')}
                    variant="like"
                    active={!!this.props.getGeneratedAnswerState()?.liked}
                    onClick={() => this.props.getGeneratedAnswer()?.like()}
                  />
                  <FeedbackButton
                    title={this.props
                      .getBindings()
                      .i18n.t('this-answer-was-not-helpful')}
                    variant="dislike"
                    active={!!this.props.getGeneratedAnswerState()?.disliked}
                    onClick={() => this.clickDislike()}
                  />
                  {this.hasClipboard ? (
                    <CopyButton
                      title={this.copyToClipboardTooltip}
                      isCopied={this.props.getCopied()}
                      error={this.props.getCopyError()}
                      onClick={async () => {
                        const answer =
                          this.props.getGeneratedAnswerState()?.answer;
                        if (answer) {
                          await this.copyToClipboard(answer);
                        }
                      }}
                    />
                  ) : null}
                </div>
              )}

            <Switch
              part="toggle"
              checked={this.isAnswerVisible}
              onToggle={(checked) => {
                checked
                  ? this.props.getGeneratedAnswer()?.show()
                  : this.props.getGeneratedAnswer()?.hide();
              }}
              ariaLabel={this.props
                .getBindings()
                .i18n.t('generated-answer-title')}
              title={this.toggleTooltip}
            ></Switch>
          </div>
        </div>
        {this.hasRetryableError && this.isAnswerVisible ? (
          <RetryPrompt
            onClick={() => this.props.getGeneratedAnswer()?.retry()}
            buttonLabel={this.props.getBindings().i18n.t('retry')}
            message={this.props.getBindings().i18n.t('retry-stream-message')}
          />
        ) : null}

        {!this.hasRetryableError && this.isAnswerVisible ? (
          <GeneratedContentContainer
            answer={this.props.getGeneratedAnswerState()?.answer}
            answerMediaType={
              this.props.getGeneratedAnswerState()?.answerMediaType
            }
            isStreaming={!!this.props.getGeneratedAnswerState()?.isStreaming}
          >
            <SourceCitations
              label={this.props.getBindings().i18n.t('citations')}
              isVisible={
                !!this.props.getGeneratedAnswerState()?.citations.length
              }
            >
              {this.renderCitations()}
            </SourceCitations>

            {!this.props.getGeneratedAnswerState()?.isStreaming && (
              <RephraseButtons
                answerStyle={
                  this.props.getGeneratedAnswerState()?.responseFormat
                    .answerStyle ?? 'default'
                }
                i18n={this.props.getBindings().i18n}
                onChange={(answerStyle) =>
                  this.onChangeAnswerStyle(answerStyle)
                }
              />
            )}
          </GeneratedContentContainer>
        ) : null}

        {!this.hasRetryableError &&
          this.isAnswerVisible &&
          !this.props.getGeneratedAnswerState()?.isStreaming && (
            <div
              part="generated-answer-footer"
              class="flex justify-end mt-6 text-neutral-dark text-xs"
            >
              <slot name="disclaimer" slot="disclaimer">
                {this.props.getBindings().i18n.t('generated-answer-disclaimer')}
              </slot>
            </div>
          )}
      </div>
    );
  }

  public render() {
    const {isLoading} = this.props.getGeneratedAnswerState() ?? {};
    if (this.shouldBeHidden) {
      return null;
    }
    return (
      <div>
        <aside
          class={`mx-auto ${
            isLoading ? this.loadingClasses : this.contentClasses
          }`}
          part="container"
        >
          <article>
            {isLoading ? <TypingLoader /> : this.renderContent()}
          </article>
        </aside>
      </div>
    );
  }
}
