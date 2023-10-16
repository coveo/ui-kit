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
import {Component, h, State, Element} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {ResultsPlaceholder} from '../../common/atomic-result-placeholder/placeholders';
import {Heading} from '../../common/heading';
import {LinkWithResultAnalytics} from '../../common/result-link/result-link';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {FeedbackButton} from './feedback-button';
import {GeneratedContentContainer} from './generated-content-container';
import {RetryPrompt} from './retry-prompt';
import {SourceCitations} from './source-citations';

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

  @BindStateToController('generatedAnswer')
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

  private stopPropagation?: boolean;
  private genAiModal?: HTMLAtomicModalElement;

  public initialize() {
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine);
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

  private get hasRetryableError() {
    return (
      !this.searchStatusState.hasError &&
      this.generatedAnswerState.error?.isRetryable
    );
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
              <div class="citation-index rounded-full font-medium rounded-full flex items-center text-bg-blue shrink-0">
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

          {!this.hasRetryableError && (
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
        </div>
        {this.hasRetryableError ? (
          <RetryPrompt
            onClick={this.generatedAnswer.retry}
            buttonLabel={this.bindings.i18n.t('retry')}
            message={this.bindings.i18n.t('retry-stream-message')}
          />
        ) : (
          <GeneratedContentContainer
            answer={this.generatedAnswerState.answer}
            isStreaming={this.generatedAnswerState.isStreaming}
          >
            <SourceCitations
              label={this.bindings.i18n.t('more-info')}
              isVisible={!!this.generatedAnswerState.citations.length}
            >
              {this.renderCitations()}
            </SourceCitations>
          </GeneratedContentContainer>
        )}
      </div>
    );
  }

  private get shouldBeHidden() {
    const {isLoading, answer, citations} = this.generatedAnswerState;
    return (
      !(isLoading || answer !== undefined || citations.length) &&
      !this.hasRetryableError
    );
  }

  public render() {
    const {isLoading, isStreaming} = this.generatedAnswerState;
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
          <article>
            {isLoading || isStreaming || this.shouldBeHidden ? (
              <ResultsPlaceholder density="compact" numberOfPlaceholders={1} />
            ) : (
              this.renderContent()
            )}
          </article>
        </aside>
      </div>
    );
  }
}
