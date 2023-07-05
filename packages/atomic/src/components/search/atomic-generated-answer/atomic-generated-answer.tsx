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
import {GeneratedContent} from './generated-content';
import {RetryPrompt} from './retry-prompt';
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
    return 'mt-4';
  }

  private get contentClasses() {
    return 'border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';
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
          <GeneratedContent
            answer={this.generatedAnswerState.answer}
            citations={this.generatedAnswerState.citations}
            citationsLabel={this.bindings.i18n.t('more-info')}
            onCitationClick={(citation) =>
              this.generatedAnswer.logCitationClick(citation.id)
            }
          />
        )}
      </div>
    );
  }

  public render() {
    const isLoading = true;
    if (this.shouldBeHidden) {
      return null;
    }
    return (
      <aside
        class={`mt-0 mx-auto mb-4 ${
          isLoading ? this.loadingClasses : this.contentClasses
        }`}
        part="container"
      >
        <article>{isLoading ? <TypingLoader /> : this.renderContent()}</article>
      </aside>
    );
  }
}
