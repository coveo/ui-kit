import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
} from '@coveo/headless';
import {Component, h, State} from '@stencil/core';
import ThumbsDownIcon from '../../../images/thumbs-down.svg';
import ThumbsUpIcon from '../../../images/thumbs-up.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
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

  private get mockCitations() {
    return [
      {
        id: 'some-fake-id',
        title: 'Fake Article About Something',
        clickUri: 'www.google.ca',
        permanentid: '12345',
        score: '0.9',
      },
      {
        id: 'some-fake-id-2',
        title: 'How to do the thing',
        clickUri: 'www.google.ca',
        permanentid: '67890',
        score: '0.8',
      },
      {
        id: 'some-fake-id-3',
        title: 'Some fake source',
        clickUri: 'www.google.ca',
        permanentid: '67890',
        score: '0.8',
      },
    ];
  }

  private get isStreamEmpty() {
    return (
      !this.generatedAnswerState.isLoading &&
      !this.generatedAnswerState.answer?.length
    );
  }

  public render() {
    if (this.searchStatusState.hasError || this.isStreamEmpty) {
      return null;
    }
    return (
      <aside
        class="bg-background border-neutral rounded-lg p-6 text-on-background"
        part="container"
      >
        <article>
          {this.generatedAnswerState.isLoading ? (
            <TypingLoader />
          ) : (
            <div part="generated-content">
              <div class="flex items-center">
                <div part="header-label" class="text-bg-blue">
                  {this.bindings.i18n.t('generated-answer-title')}
                </div>
                <div class="feedback-buttons flex">
                  <FeedbackButton
                    title={this.bindings.i18n.t('this-answer-was-helpful')}
                    icon={ThumbsUpIcon}
                    onClick={() =>
                      this.generatedAnswer.logLikeGeneratedAnswer()
                    }
                  />
                  <FeedbackButton
                    title={this.bindings.i18n.t('this-answer-was-not-helpful')}
                    icon={ThumbsDownIcon}
                    onClick={() =>
                      this.generatedAnswer.logDislikeGeneratedAnswer()
                    }
                  />
                </div>
              </div>
              <p part="generated-text">{this.generatedAnswerState.answer}</p>
              <SourceCitations
                label={this.bindings.i18n.t('more-info')}
                citations={this.mockCitations}
              />
            </div>
          )}
        </article>
      </aside>
    );
  }
}
