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
  ResultTemplatesHelpers,
  buildInteractiveResult,
} from '@coveo/headless';
import {Hidden} from '../common/hidden';
import {Heading} from '../common/heading';
import {LinkWithResultAnalytics} from '../result-link/result-link';

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
 * @part source-url - The URL to the document the excerpt is from.
 * @part source-title - The title of the document the excerpt is from.
 * @part footer - The footer underneath the answer.
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

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the question at the top of the snippet, from 1 to 5.
   *
   * We recommend setting this property in order to improve accessibility.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  /**
   * The height (in pixels) which, when exceeded by the snippet, displays a "show more" button and truncates the snippet.
   */
  @Prop({reflect: true}) minimumSnippetHeightForShowMore = 250;
  /**
   * When the answer is partly hidden, how much of its height (in pixels) should be visible.
   */
  @Prop({reflect: true}) answerHeightWhenCollapsed = 180;

  public initialize() {
    this.smartSnippet = buildSmartSnippet(this.bindings.engine);
  }

  public get source() {
    if (!this.smartSnippetState.answerFound) {
      return null;
    }
    const {contentIdKey, contentIdValue} = this.smartSnippetState.documentId;
    const linkedDocument = this.bindings.engine.state.search.results.find(
      (result) =>
        ResultTemplatesHelpers.getResultProperty(result, contentIdKey) ===
        contentIdValue
    );
    return linkedDocument ?? null;
  }

  public renderQuestion() {
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

  public renderContent() {
    return (
      <atomic-smart-snippet-expandable-answer
        exportparts="answer,show-more-button,show-less-button,truncated-answer"
        part="body"
        minimumSnippetHeightForShowMore={this.minimumSnippetHeightForShowMore}
        answerHeightWhenCollapsed={this.answerHeightWhenCollapsed}
      ></atomic-smart-snippet-expandable-answer>
    );
  }

  public renderSource() {
    const source = this.source;
    if (!source) {
      return [];
    }
    const interactiveResult = buildInteractiveResult(this.bindings.engine, {
      options: {result: source},
    });
    return (
      <section aria-label={this.bindings.i18n.t('smart-snippet-source')}>
        <div part="source-url">
          <LinkWithResultAnalytics
            title={source.clickUri}
            href={source.clickUri}
            interactiveResult={interactiveResult}
            target="_self"
          >
            {source.clickUri}
          </LinkWithResultAnalytics>
        </div>
        <div part="source-title">
          <LinkWithResultAnalytics
            title={source.title}
            href={source.clickUri}
            interactiveResult={interactiveResult}
            target="_self"
          >
            {source.title}
          </LinkWithResultAnalytics>
        </div>
      </section>
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
          <footer part="footer">{this.renderSource()}</footer>
        </article>
      </aside>
    );
  }
}
