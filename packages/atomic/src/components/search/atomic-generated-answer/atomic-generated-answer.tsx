import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
} from '@coveo/headless';
import {Component, h, Prop, State, Element} from '@stencil/core';
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
import {ShowMoreButton} from './show-more-button';
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
  @Element() public host!: HTMLElement;

  public generatedAnswer!: GeneratedAnswer;
  public searchStatus!: SearchStatus;

  private resizeObserver: ResizeObserver | undefined;

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
  @State()
  isExpanded = false;

  /**
   * Specifies the maximum height the component should have before hiding part of the answer.
   */
  @Prop({reflect: true}) maxHeight?: string;

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

  private get contentElement(): HTMLElement | null | undefined {
    return this.host.shadowRoot?.querySelector('[part="generated-content"]');
  }

  private checkElementOverflow(el: HTMLElement) {
    const currentOverflow = el.style.overflow;

    if (!currentOverflow || currentOverflow === 'visible') {
      el.style.overflow = 'hidden';
    }

    const isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

    el.style.overflow = currentOverflow;

    return isOverflowing;
  }

  private get hasContentOverflow() {
    return this.contentElement
      ? this.checkElementOverflow(this.contentElement)
      : false;
  }

  private get isHidingContent() {
    return !!this.maxHeight && this.hasContentOverflow && !this.isExpanded;
  }

  private get contentMaxHeight() {
    if (this.hasRetryableError || !this.maxHeight || this.isExpanded) {
      return;
    }
    return this.maxHeight;
  }

  private renderContent() {
    return (
      <div>
        <div
          part="generated-content"
          class="overflow-hidden"
          style={{
            maxHeight: this.contentMaxHeight,
          }}
        >
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
              isStreaming={this.generatedAnswerState.isStreaming}
              citationsLabel={this.bindings.i18n.t('more-info')}
              onCitationClick={(citation) =>
                this.generatedAnswer.logCitationClick(citation.id)
              }
            />
          )}
        </div>
        {this.isHidingContent ? (
          <div class="mt-4">
            <ShowMoreButton
              label={this.bindings.i18n.t('show-more')}
              ariaLabel={this.bindings.i18n.t('show-full-generated-answer')}
              onClick={() => (this.isExpanded = !this.isExpanded)}
              isOpen={this.isExpanded}
            />
          </div>
        ) : null}
      </div>
    );
  }

  public componentDidLoad() {
    this.resizeObserver = new ResizeObserver(this.render);
    this.resizeObserver.observe(this.host);
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  public render() {
    console.log(this.hasContentOverflow);

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
        <article>
          {isLoading ? <TypingLoader /> : this.renderContent()}{' '}
        </article>
      </aside>
    );
  }
}
