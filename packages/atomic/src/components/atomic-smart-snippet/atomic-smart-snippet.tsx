import {Component, h, Prop, State, Element} from '@stencil/core';
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
import {findSmartSnippetStyleTag} from './smart-snippet-common';

/**
 * The `atomic-smart-snippet` component displays the excerpt of a document that would be most likely to answer a particular query.
 *
 * The style of rendered answers can be customized by adding a style tag in a template tag like so:
 * ```html
 * <atomic-smart-snippet>
 *   <template>
 *     <style>
 *       b { color: red; }
 *     </style>
 *   </template>
 * </atomic-smart-snippet>
 * ```
 *
 * @part smart-snippet - The wrapper of the entire smart snippet.
 * @part question - The header displaying the question that is answered by the found document excerpt.
 * @part answer - The found document excerpt.
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
  @Element() public host!: HTMLElement;
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
        class="mb-4 text-xl font-bold"
        part="question"
      >
        {this.smartSnippetState.question}
      </Heading>
    );
  }

  public renderContent() {
    return (
      <atomic-smart-snippet-answer
        htmlContent={this.smartSnippetState.answer}
        styleTag={findSmartSnippetStyleTag(this.host)}
        exportparts="answer"
      ></atomic-smart-snippet-answer>
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
