import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerCitation,
  GeneratedAnswerStyle,
  buildInteractiveCitation,
} from '@coveo/headless';
import {Component, h, Element, State, Prop} from '@stencil/core';
import {AriaLiveRegion} from '../../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {
  GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../../utils/local-storage-utils';
import {Heading} from '../../../common/heading';
import {Switch} from '../../../common/switch';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {CopyButton} from './copy-button';
import {FeedbackButton} from './feedback-button';
import {GeneratedContentContainer} from './generated-content-container';
import {RephraseButtons} from './rephrase-buttons';
import {RetryPrompt} from './retry-prompt';
import {SourceCitations} from './source-citations';
import {TypingLoader} from './typing-loader';

/**
 * @internal
 */
@Component({
  tag: 'atomic-generated-answer',
  styleUrl: 'atomic-generated-answer.pcss',
  shadow: true,
})
export class AtomicGeneratedAnswer implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public generatedAnswer!: GeneratedAnswer;
  public searchStatus!: SearchStatus;

  @BindStateToController('generatedAnswer', {
    onUpdateCallbackMethod: 'onGeneratedAnswerStateUpdate',
  })
  @State()
  private generatedAnswerState!: GeneratedAnswerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  @State()
  public error!: Error;

  @State()
  private modalRef!: HTMLAtomicGeneratedAnswerFeedbackModalElement;

  @Element() private host!: HTMLElement;

  @State()
  copied = false;

  /**
   * The answer style to apply when the component first loads.
   * Options:
   *   - `default`: Generates the answer without additional formatting instructions.
   *   - `bullet`: Requests the answer to be generated in bullet-points.
   *   - `step`: Requests the answer to be generated in step-by-step instructions.
   *   - `concise`: Requests the answer to be generated as concisely as possible.
   */
  @Prop() answerStyle: GeneratedAnswerStyle = 'default';

  @AriaLiveRegion('generated-answer')
  protected ariaMessage!: string;

  private storage: SafeStorage = new SafeStorage();
  private data?: GeneratedAnswerData;

  public initialize() {
    this.data = this.readStoredData();
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.data.isVisible,
        responseFormat: {
          answerStyle: this.answerStyle,
        },
      },
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    const modalRef = document.createElement(
      'atomic-generated-answer-feedback-modal'
    );
    this.modalRef = modalRef;
    modalRef.generatedAnswer = this.generatedAnswer;
    this.host.insertAdjacentElement('beforebegin', modalRef);
  }

  // @ts-expect-error: This function is used by BindStateToController.
  private onGeneratedAnswerStateUpdate = () => {
    if (this.generatedAnswerState.isVisible !== this.data?.isVisible) {
      this.data = {
        ...this.data,
        isVisible: this.generatedAnswerState.isVisible,
      };
      this.writeStoredData(this.data);
    }

    this.ariaMessage = this.getGeneratedAnswerStatus();
  };

  private getGeneratedAnswerStatus() {
    const isVisible = this.generatedAnswerState.isVisible;
    const isGenerating =
      this.generatedAnswerState.isLoading ||
      this.generatedAnswerState.isStreaming;
    const hasAnswer = !!this.generatedAnswerState.answer;

    if (!isVisible) {
      return this.bindings.i18n.t('generated-answer-hidden');
    }

    if (isGenerating) {
      return this.bindings.i18n.t('generating-answer');
    }

    if (this.error) {
      return this.bindings.i18n.t('answer-could-not-be-generated');
    }

    return hasAnswer
      ? this.bindings.i18n.t('answer-generated', {
          answer: this.generatedAnswerState.answer,
        })
      : '';
  }

  private readStoredData(): GeneratedAnswerData {
    return this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );
  }

  private writeStoredData(data: GeneratedAnswerData) {
    this.storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
  }

  private get hasRetryableError() {
    return (
      !this.searchStatusState.hasError &&
      this.generatedAnswerState.error?.isRetryable
    );
  }

  private get shouldBeHidden() {
    const {isLoading, answer, citations} = this.generatedAnswerState;
    return (
      !(isLoading || answer !== undefined || citations.length) &&
      !this.hasRetryableError
    );
  }

  private get isAnswerVisible() {
    return this.generatedAnswerState.isVisible;
  }

  private get toggleTooltip() {
    const key = this.isAnswerVisible
      ? 'generated-answer-toggle-on'
      : 'generated-answer-toggle-off';
    return this.bindings.i18n.t(key);
  }

  private get loadingClasses() {
    return 'my-3';
  }

  private get contentClasses() {
    return 'mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';
  }

  private async copyToClipboard(answer: string) {
    await navigator.clipboard.writeText(answer);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  private renderCitations() {
    return this.generatedAnswerState.citations.map(
      (citation: GeneratedAnswerCitation, index: number) => {
        const interactiveCitation = buildInteractiveCitation(
          this.bindings.engine,
          {
            options: {
              citation,
            },
          }
        );
        return (
          <li key={citation.id} class="max-w-full">
            <atomic-citation
              citation={citation}
              index={index}
              sendHoverEndEvent={(citationHoverTimeMs: number) => {
                this.generatedAnswer.logCitationHover(
                  citation.id,
                  citationHoverTimeMs
                );
              }}
              interactiveCitation={interactiveCitation}
            />
          </li>
        );
      }
    );
  }

  private clickDislike = () => {
    if (this.modalRef && !this.generatedAnswerState.feedbackSubmitted) {
      this.modalRef.isOpen = true;
    }
    this.generatedAnswer.dislike();
  };

  private renderContent() {
    return (
      <div part="generated-content">
        <div class="flex items-center">
          <Heading
            level={0}
            part="header-label"
            class="text-bg-primary font-medium inline-block rounded-md py-2 px-2.5"
          >
            {this.bindings.i18n.t('generated-answer-title')}
          </Heading>
          <div class="flex gap-2 h-9 items-center ml-auto">
            {!this.hasRetryableError &&
              !this.generatedAnswerState.isStreaming &&
              this.isAnswerVisible && (
                <div class="feedback-buttons flex shrink-0 gap-2 ml-auto">
                  <FeedbackButton
                    title={this.bindings.i18n.t('this-answer-was-helpful')}
                    variant="like"
                    active={this.generatedAnswerState.liked}
                    onClick={this.generatedAnswer.like}
                  />
                  <FeedbackButton
                    title={this.bindings.i18n.t('this-answer-was-not-helpful')}
                    variant="dislike"
                    active={this.generatedAnswerState.disliked}
                    onClick={this.clickDislike}
                  />
                  <CopyButton
                    title={
                      !this.copied
                        ? this.bindings.i18n.t('copy-generated-answer')
                        : this.bindings.i18n.t('generated-answer-copied')
                    }
                    isCopied={this.copied}
                    onClick={() => {
                      this.copyToClipboard(this.generatedAnswerState.answer!);
                      this.generatedAnswer.logCopyToClipboard();
                    }}
                  />
                </div>
              )}

            <Switch
              part="toggle"
              checked={this.isAnswerVisible}
              onToggle={(checked) => {
                checked
                  ? this.generatedAnswer.show()
                  : this.generatedAnswer.hide();
              }}
              ariaLabel={this.bindings.i18n.t('generated-answer-title')}
              title={this.toggleTooltip}
            ></Switch>
          </div>
        </div>
        {this.hasRetryableError && this.isAnswerVisible ? (
          <RetryPrompt
            onClick={this.generatedAnswer.retry}
            buttonLabel={this.bindings.i18n.t('retry')}
            message={this.bindings.i18n.t('retry-stream-message')}
          />
        ) : null}

        {!this.hasRetryableError && this.isAnswerVisible ? (
          <GeneratedContentContainer
            answer={this.generatedAnswerState.answer}
            isStreaming={this.generatedAnswerState.isStreaming}
          >
            <SourceCitations
              label={this.bindings.i18n.t('citations')}
              isVisible={!!this.generatedAnswerState.citations.length}
            >
              {this.renderCitations()}
            </SourceCitations>

            {!this.generatedAnswerState.isStreaming && (
              <RephraseButtons
                answerStyle={
                  this.generatedAnswerState.responseFormat.answerStyle
                }
                i18n={this.bindings.i18n}
                onChange={(answerStyle: GeneratedAnswerStyle) =>
                  this.generatedAnswer.rephrase({answerStyle})
                }
              />
            )}
          </GeneratedContentContainer>
        ) : null}
      </div>
    );
  }

  public render() {
    const {isLoading} = this.generatedAnswerState;
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
