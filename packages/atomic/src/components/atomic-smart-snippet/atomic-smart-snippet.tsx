import {Component, h, Prop, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  Bindings,
  BindStateToController,
} from '../../utils/initialization-utils';
import {
  buildSmartSnippet,
  SmartSnippet,
  SmartSnippetState,
} from '@coveo/headless';
import {Hidden} from '../common/hidden';
import {Heading} from '../common/heading';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {SmartSnippetFeedbackBanner} from './atomic-smart-snippet-feedback-banner';
import {randomID} from '../../utils/utils';

/**
 * The `atomic-smart-snippet` component displays the excerpt of a document that would be most likely to answer a particular query.
 *
 * @part smart-snippet - The wrapper of the entire smart snippet.
 * @part question - The header displaying the question that is answered by the found document excerpt.
 * @part answer - The container displaying the full document excerpt.
 * @part truncated-answer - The container displaying only part of the answer.
 * @part show-more-button - The show more button.
 * @part show-less-button - The show less button.
 * @part body - The body of the smart snippet, containing the truncated answer and the show more or show less button.
 * @part footer - The footer underneath the answer.
 * @part source-url - The URL to the document the excerpt is from.
 * @part source-title - The title of the document the excerpt is from.
 * @part feedback-banner - The feedback banner underneath the source.
 * @part feedback-inquiry-and-buttons - A wrapper around the feedback inquiry and the feedback buttons.
 * @part feedback-inquiry - The message asking the end user to provide feedback on whether the excerpt was useful.
 * @part feedback-buttons - The wrapper around the buttons after the inquiry.
 * @part feedback-like-button - The button allowing the end user to signal that the excerpt was useful.
 * @part feedback-dislike-button - The button allowing the end user to signal that the excerpt wasn't useful.
 * @part feedback-thank-you - The message thanking the end user for providing feedback.
 */
@Component({
  tag: 'atomic-smart-snippet',
  styleUrl: 'atomic-smart-snippet.pcss',
  shadow: true,
})
export class AtomicSmartSnippet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public smartSnippet!: SmartSnippet;
  @BindStateToController('smartSnippet')
  @State()
  public smartSnippetState!: SmartSnippetState;
  public error!: Error;
  private id = randomID();

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the question at the top of the snippet, from 1 to 5.
   *
   * We recommend setting this property in order to improve accessibility.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  /**
   * The maximum height (in pixels) a snippet can have before the component truncates it and displays a "show more" button.
   */
  @Prop({reflect: true}) maximumHeight = 250;
  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @Prop({reflect: true}) collapsedHeight = 180;

  public initialize() {
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
  }

  private renderQuestion() {
    return (
      <Heading
        level={this.headingLevel ? this.headingLevel + 1 : 0}
        class="text-xl font-bold"
        part="question"
      >
        {this.smartSnippetState.question}
      </Heading>
    );
  }

  private renderContent() {
    return (
      <atomic-smart-snippet-expandable-answer
        exportparts="answer,show-more-button,show-less-button,truncated-answer"
        part="body"
        maximumHeight={this.maximumHeight}
        collapsedHeight={this.collapsedHeight}
      ></atomic-smart-snippet-expandable-answer>
    );
  }

  private renderSource() {
    const {source} = this.smartSnippetState;
    if (!source) {
      return [];
    }
    return (
      <section aria-label={this.bindings.i18n.t('smart-snippet-source')}>
        <div part="source-url">
          <LinkWithResultAnalytics
            title={source.clickUri}
            href={source.clickUri}
            target="_self"
            onSelect={() => this.smartSnippet.selectSource()}
            onBeginDelayedSelect={() =>
              this.smartSnippet.beginDelayedSelectSource()
            }
            onCancelPendingSelect={() =>
              this.smartSnippet.cancelPendingSelectSource()
            }
          >
            {source.clickUri}
          </LinkWithResultAnalytics>
        </div>
        <div part="source-title" class="mb-6">
          <LinkWithResultAnalytics
            title={source.title}
            href={source.clickUri}
            target="_self"
            onSelect={() => this.smartSnippet.selectSource()}
            onBeginDelayedSelect={() =>
              this.smartSnippet.beginDelayedSelectSource()
            }
            onCancelPendingSelect={() =>
              this.smartSnippet.cancelPendingSelectSource()
            }
          >
            {source.title}
          </LinkWithResultAnalytics>
        </div>
      </section>
    );
  }

  public renderFeedbackBanner() {
    return (
      <SmartSnippetFeedbackBanner
        i18n={this.bindings.i18n}
        id={this.id}
        liked={this.smartSnippetState.liked}
        disliked={this.smartSnippetState.disliked}
        onLike={() => this.smartSnippet.like()}
        onDislike={() => this.smartSnippet.dislike()}
      ></SmartSnippetFeedbackBanner>
    );
  }

  public render() {
    if (!this.smartSnippetState.answerFound) {
      return <Hidden></Hidden>;
    }

    return (
      <aside>
        <Heading level={this.headingLevel ?? 0} class="accessibility-only">
          {this.bindings.i18n.t('smart-snippet')}
        </Heading>
        <article
          class="bg-background border border-neutral rounded-lg p-6 pb-4 text-on-background mb-6"
          part="smart-snippet"
        >
          {this.renderQuestion()}
          {this.renderContent()}
          <footer part="footer">
            {this.renderSource()}
            {this.renderFeedbackBanner()}
          </footer>
        </article>
      </aside>
    );
  }
}
