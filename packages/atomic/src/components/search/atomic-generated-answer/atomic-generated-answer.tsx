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
import {Button} from '../../common/button';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {FeedbackButton} from './feedback-button';
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

  private get hideComponent() {
    const {isLoading, answer, citations} = this.generatedAnswerState;
    return (
      !(isLoading || answer !== undefined || citations.length) &&
      !this.hasRetryableError
    );
  }

  private renderContent() {
    return (
      <div part="generated-content">
        <div class="flex items-center">
          <div part="header-label" class="text-bg-blue">
            {this.bindings.i18n.t('generated-answer-title')}
          </div>
          {!this.generatedAnswerState.error && (
            <div class="feedback-buttons flex">
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
        {this.generatedAnswerState.error?.isRetryable ? (
          <div part="retry-container" class="mt-4">
            <div class="mx-auto text-center text-neutral-dark">
              {this.generatedAnswerState.error?.message ??
                this.bindings.i18n.t('something-went-wrong')}
            </div>
            <Button
              class="block px-4 py-2 mt-4 mx-auto"
              style="outline-primary"
              onClick={this.generatedAnswer.retry}
            >
              {this.bindings.i18n.t('retry')}
            </Button>
          </div>
        ) : (
          <div>
            <p part="generated-text">{this.generatedAnswerState.answer}</p>
            <SourceCitations
              label={this.bindings.i18n.t('more-info')}
              citations={this.generatedAnswerState.citations}
              onCitationClick={(citation) =>
                this.generatedAnswer.logCitationClick(citation.id)
              }
            />
          </div>
        )}
      </div>
    );
  }

  public render() {
    if (this.hideComponent) {
      return null;
    }
    return (
      <aside
        class="bg-background border-neutral rounded-lg p-6 text-on-background"
        part="container"
      >
        <article>
          {this.generatedAnswerState.isLoading ? (
            <TypingLoader
              loadingLabel={this.bindings.i18n.t('generated-answer-loading')}
            />
          ) : (
            this.renderContent()
          )}
        </article>
      </aside>
    );
  }
}
