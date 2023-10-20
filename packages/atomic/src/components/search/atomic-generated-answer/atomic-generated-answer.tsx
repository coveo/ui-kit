import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
  buildInteractiveCitation,
  GeneratedAnswerCitation,
} from '@coveo/headless';
import {GeneratedAnswerStyle} from '@coveo/headless/dist/definitions/features/generated-answer/generated-response-format';
import {Component, h, State, Element, Prop} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {Heading} from '../../common/heading';
import {LinkWithResultAnalytics} from '../../common/result-link/result-link';
import {Switch} from '../../common/switch';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {FeedbackButton} from './feedback-button';
import {GeneratedContentContainer} from './generated-content-container';
import {GeneratedAnswerPlaceholder} from './placeholders';
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
  hidden = true;

  @Element() private host!: HTMLElement;

  /**
   * The answer style to apply when the component first loads.
   * Options:
   *   - `default`: Generates the answer without additional formatting instructions.
   *   - `bullet`: Requests the answer to be generated in bullet-points.
   *   - `step`: Requests the answer to be generated in step-by-step instructions.
   *   - `concise`: Requests the answer to be generated as concisely as possible.
   */
  @Prop() answerStyle: GeneratedAnswerStyle = 'default';

  private stopPropagation?: boolean;
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
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
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
  };

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

  private get contentClasses() {
    return 'mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';
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
          <li key={citation.id}>
            <LinkWithResultAnalytics
              href={citation.clickUri ?? citation.uri}
              title={citation.title}
              part="citation"
              target="_blank"
              rel="noopener"
              className="flex items-center p-1 bg-background btn-text-neutral border rounded-full border-neutral text-on-background"
              onSelect={() => interactiveCitation.select()}
              onBeginDelayedSelect={() =>
                interactiveCitation.beginDelayedSelect()
              }
              onCancelPendingSelect={() =>
                interactiveCitation.cancelPendingSelect()
              }
              stopPropagation={this.stopPropagation}
            >
              <div class="citation-index rounded-full font-medium flex items-center text-bg-blue shrink-0">
                <div class="mx-auto">{index + 1}</div>
              </div>
              <span class="citation-title truncate mx-1">{citation.title}</span>
            </LinkWithResultAnalytics>
          </li>
        );
      }
    );
  }

  private renderContent() {
    return (
      <div part="generated-content">
        <div class="flex items-center">
          <Heading
            level={0}
            part="header-label"
            class="text-bg-blue font-medium inline-block rounded-md py-2 px-2.5"
          >
            {this.bindings.i18n.t('generated-answer-title')}
          </Heading>

          <div class="flex gap-2 h-9 items-center ml-auto">
            {!this.hasRetryableError &&
              !this.generatedAnswerState.isStreaming &&
              this.isAnswerVisible && (
                <div class="feedback-buttons flex gap-2 ml-auto">
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
                    onClick={this.generatedAnswer.dislike}
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

  private loadingAnimationContent() {
    const {isLoading, isStreaming} = this.generatedAnswerState;

    if (isLoading || this.shouldBeHidden) {
      return (
        <div class="placeholder-wrapper relative overflow-hidden">
          <GeneratedAnswerPlaceholder />
        </div>
      );
    } else if (isStreaming) {
      return (
        <div class="placeholder-wrapper relative overflow-hidden">
          <div class="z-1 bg-white relative">{this.renderContent()}</div>
          <div class="absolute inset-0">
            <GeneratedAnswerPlaceholder />
          </div>
          <div class="typing-loader-wrapper absolute inset-x-0 bottom-0 w-full z-1 pt-40">
            <TypingLoader />
          </div>
        </div>
      );
    } else {
      return this.renderContent();
    }
  }

  public render() {
    const {isLoading} = this.generatedAnswerState;
    isLoading
      ? this.bindings.store.setLoadingFlag('generatedAnswer')
      : this.bindings.store.unsetLoadingFlag('generatedAnswer');

    return (
      <div
        slot="body"
        part="wrap_er"
        class={`overflow-hidden ${this.shouldBeHidden ? 'max-h-0' : ''}`}
      >
        <aside class={`mx-auto ${this.contentClasses}`} part="container">
          <article>{this.loadingAnimationContent()}</article>
        </aside>
      </div>
    );
  }
}
