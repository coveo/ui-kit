import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Heading} from '../../common/heading';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {FeedbackButton} from './feedback-button';
import {RetryPrompt} from './retry-prompt';
import {TypingLoader} from './typing-loader';
import {SourceCitations} from './source-citations';
import {GeneratedAnswerCitation} from '../../../components';
import {GeneratedContentContainer} from './generated-content-container';

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

  public initialize() {
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine);
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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

  private get loadingClasses() {
    return 'my-3';
  }

  private get contentClasses() {
    return 'mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';
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
              {this.generatedAnswerState.citations.map(
                (citation: GeneratedAnswerCitation, index: number) => (
                  <li key={citation.id}>
                    <atomic-source-citation
                      index={index}
                      citation={citation}
                      href={citation.clickUri ?? citation.uri}
                    ></atomic-source-citation>
                  </li>
                )
              )}
            </SourceCitations>
          </GeneratedContentContainer>
        )}
      </div>
    );
  }

  public render() {
    const {isLoading} = this.generatedAnswerState;
    if (this.shouldBeHidden) {
      return null;
    }
    return (
      <aside
        class={`mx-auto ${
          isLoading ? this.loadingClasses : this.contentClasses
        }`}
        part="container"
      >
        <article>{isLoading ? <TypingLoader /> : this.renderContent()}</article>
      </aside>
    );
  }
}
