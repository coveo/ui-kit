import {Component, h, Prop, State, Element} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  Bindings,
  BindStateToController,
} from '../../utils/initialization-utils';
import ArrowRight from '../../images/arrow-right.svg';
import ArrowDown from '../../images/arrow-down.svg';
import {
  buildInteractiveResult,
  buildSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {Hidden} from '../common/hidden';
import {Heading} from '../common/heading';
import {LinkWithResultAnalytics} from '../result-link/result-link';
import {Button} from '../common/button';
import {randomID} from '../../utils/utils';

/**
 * The `atomic-smart-snippet-suggestions-suggestions` component displays an accordion of questions related to the query with their corresponding answers.
 *
 * You can style the snippets by inserting a template element like this:
 * ```html
 * <atomic-smart-snippet-suggestions>
 *   <template>
 *     <style>
 *       b {
 *         color: blue;
 *       }
 *     </style>
 *   </template>
 * </atomic-smart-snippet-suggestions>
 * ```
 *
 * @part container - The wrapper with a border around the entire component.
 * @part heading - The heading above the list of related questions.
 * @part questions - The list of related questions.
 * @part question-answer-expanded - An expanded related question.
 * @part question-answer-collapsed - A collapsed related question.
 * @part question-button-expanded - The button to collapse a related question.
 * @part question-button-collapsed - The button to expand a related question.
 * @part question-icon-expanded - The caret of an expanded related question.
 * @part question-icon-collapsed - The caret of a collapsed related question.
 * @part question-text-expanded - The title of an expanded related question.
 * @part question-text-collapsed - The title of a collapsed related question.
 * @part answer-and-source - The wrapper around the answer and source of a related question.
 * @part answer - The container displaying the full document excerpt of a related question's answer.
 * @part footer - The wrapper around the source of a related question's answer.
 * @part source-url - The URL to the document a related question's answer is extracted from.
 * @part source-title - The title of the document a related question's answer is extracted from.
 *
 * @internal
 */
@Component({
  tag: 'atomic-smart-snippet-suggestions',
  styleUrl: 'atomic-smart-snippet-suggestions.pcss',
  shadow: true,
})
export class AtomicSmartSnippetSuggestions implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public smartSnippetQuestionsList!: SmartSnippetQuestionsList;
  @BindStateToController('smartSnippetQuestionsList')
  @State()
  public smartSnippetQuestionsListState!: SmartSnippetQuestionsListState;
  public error!: Error;
  @Element() public host!: HTMLElement;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the "People also ask" heading over the snippets, from 1 to 5.
   *
   * We recommend setting this property in order to improve accessibility.
   *
   */
  @Prop({reflect: true}) public headingLevel = 0;

  /**
   * Sets the style of the snippets.
   *
   * Example:
   * ```ts
   * smartSnippet.snippetStyle = `
   *   b {
   *     color: blue;
   *   }
   * `;
   * ```
   */
  @Prop({reflect: true}) snippetStyle?: string;

  private id = randomID('atomic-smart-snippet-suggestions-');

  public initialize() {
    this.smartSnippetQuestionsList = buildSmartSnippetQuestionsList(
      this.bindings.engine
    );
  }

  private getRelatedQuestionId(relatedQuestion: SmartSnippetRelatedQuestion) {
    // TODO: Change to the snippet's unique ID
    return `${this.id}-${relatedQuestion.question
      .toLowerCase()
      .replace(/\s/g, '-')
      .replace(/[^a-z-]/g, '')}`;
  }

  private getQuestionPart(
    prefix: string,
    relatedQuestion: SmartSnippetRelatedQuestion
  ) {
    return prefix + (relatedQuestion.expanded ? '-expanded' : '-collapsed');
  }

  private get style() {
    const styleTag = this.host
      .querySelector('template')
      ?.content.querySelector('style');
    if (!styleTag) {
      return this.snippetStyle;
    }
    return styleTag.innerHTML;
  }

  private renderQuestion(relatedQuestion: SmartSnippetRelatedQuestion) {
    const toggleRelatedQuestion = () =>
      relatedQuestion.expanded
        ? this.smartSnippetQuestionsList.collapse(relatedQuestion.documentId)
        : this.smartSnippetQuestionsList.expand(relatedQuestion.documentId);

    return (
      <Button
        style="text-neutral"
        part={this.getQuestionPart('question-button', relatedQuestion)}
        onClick={toggleRelatedQuestion}
        class="flex items-center px-4"
        ariaExpanded={relatedQuestion.expanded}
        ariaControls={this.getRelatedQuestionId(relatedQuestion)}
      >
        <atomic-icon
          icon={relatedQuestion.expanded ? ArrowDown : ArrowRight}
          part={this.getQuestionPart('question-icon', relatedQuestion)}
          class="w-2.5 mr-3 stroke-[1.25]"
        ></atomic-icon>
        <Heading
          level={this.headingLevel ? this.headingLevel + 1 : 0}
          class="text-left text-xl font-bold py-4"
          part={this.getQuestionPart('question-text', relatedQuestion)}
        >
          {relatedQuestion.question}
        </Heading>
      </Button>
    );
  }

  private renderContent(relatedQuestion: SmartSnippetRelatedQuestion) {
    return (
      <atomic-smart-snippet-answer
        exportparts="answer"
        htmlContent={relatedQuestion.answer}
        innerStyle={this.style}
      ></atomic-smart-snippet-answer>
    );
  }

  private renderSource(relatedQuestion: SmartSnippetRelatedQuestion) {
    const {source} = relatedQuestion;
    if (!source) {
      return [];
    }
    const interactiveResult = buildInteractiveResult(this.bindings.engine!, {
      options: {result: source},
    });
    return (
      <section aria-label={this.bindings.i18n.t('smart-snippet-source')}>
        <LinkWithResultAnalytics
          title={source.clickUri}
          href={source.clickUri}
          target="_self"
          part="source-url"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
        >
          {source.clickUri}
        </LinkWithResultAnalytics>
        <LinkWithResultAnalytics
          title={source.title}
          href={source.clickUri}
          target="_self"
          part="source-title"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
        >
          {source.title}
        </LinkWithResultAnalytics>
      </section>
    );
  }

  public renderRelatedQuestion(relatedQuestion: SmartSnippetRelatedQuestion) {
    return (
      <li
        key={this.getRelatedQuestionId(relatedQuestion)}
        part={this.getQuestionPart('question-answer', relatedQuestion)}
        class="flex flex-col"
      >
        {this.renderQuestion(relatedQuestion)}
        <div
          part={relatedQuestion.expanded ? 'answer-and-source' : ''}
          class={relatedQuestion.expanded ? 'pl-10 pr-6 pb-6' : 'hidden'}
          id={this.getRelatedQuestionId(relatedQuestion)}
        >
          {this.renderContent(relatedQuestion)}
          <footer part="footer">{this.renderSource(relatedQuestion)}</footer>
        </div>
      </li>
    );
  }

  public render() {
    if (!this.smartSnippetQuestionsListState.questions.length) {
      return <Hidden></Hidden>;
    }

    return (
      <aside
        part="container"
        class="bg-background border border-neutral rounded-lg text-on-background mb-6 overflow-hidden"
      >
        <Heading
          level={this.headingLevel ?? 0}
          part="heading"
          class="px-6 py-4 text-2xl leading-8 border-b border-neutral"
        >
          {this.bindings.i18n.t('smart-snippet-people-also-ask')}
        </Heading>
        <ul part="questions" class="divide-neutral divide-y">
          {this.smartSnippetQuestionsListState.questions.map(
            (relatedQuestion) => this.renderRelatedQuestion(relatedQuestion)
          )}
        </ul>
      </aside>
    );
  }
}
