import {
  buildSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {Component, h, Prop, State, Element} from '@stencil/core';
import ArrowDown from '../../../images/arrow-down.svg';
import ArrowRight from '../../../images/arrow-right.svg';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {Button} from '../../common/button';
import {Heading} from '../../common/heading';
import {Hidden} from '../../common/hidden';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

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
  @Prop() snippetStyle?: string;

  private id = randomID('atomic-smart-snippet-suggestions-');

  public initialize() {
    this.smartSnippetQuestionsList = buildSmartSnippetQuestionsList(
      this.bindings.engine
    );

    this.hideDuringRender = true;
    this.bindings.store.waitUntilAppLoaded(() => {
      this.hideDuringRender = false;
    });
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

  private set hideDuringRender(shouldHide: boolean) {
    this.host.style.visibility = shouldHide ? 'hidden' : '';
    this.host.style.position = shouldHide ? 'absolute' : '';
  }

  private getRelatedQuestionId(index: number) {
    return `${this.id}-${index}`;
  }

  private getQuestionPart(
    prefix: string,
    relatedQuestion: SmartSnippetRelatedQuestion
  ) {
    return prefix + (relatedQuestion.expanded ? '-expanded' : '-collapsed');
  }

  private toggleQuestion(relatedQuestion: SmartSnippetRelatedQuestion) {
    if (relatedQuestion.expanded) {
      this.smartSnippetQuestionsList.collapse(relatedQuestion.questionAnswerId);
    } else {
      this.smartSnippetQuestionsList.expand(relatedQuestion.questionAnswerId);
    }
  }

  private renderQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return (
      <Button
        style="text-neutral"
        part={this.getQuestionPart('question-button', relatedQuestion)}
        onClick={() => this.toggleQuestion(relatedQuestion)}
        class="flex items-center px-4"
        ariaExpanded={`${relatedQuestion.expanded}`}
        ariaControls={this.getRelatedQuestionId(index)}
      >
        <atomic-icon
          icon={relatedQuestion.expanded ? ArrowDown : ArrowRight}
          part={this.getQuestionPart('question-icon', relatedQuestion)}
          class="w-2.5 mr-3 stroke-[1.25]"
        ></atomic-icon>
        <Heading
          level={this.headingLevel ? this.headingLevel + 1 : this.headingLevel}
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
        onSelectInlineLink={(e) =>
          this.smartSnippetQuestionsList.selectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )
        }
        onBeginDelayedSelectInlineLink={(e) =>
          this.smartSnippetQuestionsList.beginDelayedSelectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )
        }
        onCancelPendingSelectInlineLink={(e) =>
          this.smartSnippetQuestionsList.cancelPendingSelectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )
        }
      ></atomic-smart-snippet-answer>
    );
  }

  private renderSource(relatedQuestion: SmartSnippetRelatedQuestion) {
    const {source} = relatedQuestion;
    if (!source) {
      return [];
    }
    return (
      <footer
        part="footer"
        aria-label={this.bindings.i18n.t('smart-snippet-source')}
      >
        {
          <atomic-smart-snippet-source
            source={source}
            onSelectSource={() =>
              this.smartSnippetQuestionsList.selectSource(
                relatedQuestion.questionAnswerId
              )
            }
            onBeginDelayedSelectSource={() =>
              this.smartSnippetQuestionsList.beginDelayedSelectSource(
                relatedQuestion.questionAnswerId
              )
            }
            onCancelPendingSelectSource={() =>
              this.smartSnippetQuestionsList.cancelPendingSelectSource(
                relatedQuestion.questionAnswerId
              )
            }
          ></atomic-smart-snippet-source>
        }
      </footer>
    );
  }

  public renderRelatedQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return (
      <li
        key={relatedQuestion.questionAnswerId}
        part={this.getQuestionPart('question-answer', relatedQuestion)}
        class="flex flex-col"
      >
        <article class="contents">
          {this.renderQuestion(relatedQuestion, index)}
          {relatedQuestion.expanded && (
            <div
              part="answer-and-source"
              class="pl-10 pr-6 pb-6"
              id={this.getRelatedQuestionId(index)}
            >
              {this.renderContent(relatedQuestion)}
              {this.renderSource(relatedQuestion)}
            </div>
          )}
        </article>
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
        class="bg-background border border-neutral rounded-lg text-on-background overflow-hidden"
      >
        <Heading
          level={this.headingLevel}
          part="heading"
          class="px-6 py-4 text-2xl leading-8 border-b border-neutral"
        >
          {this.bindings.i18n.t('smart-snippet-people-also-ask')}
        </Heading>
        <ul part="questions" class="divide-neutral divide-y">
          {this.smartSnippetQuestionsListState.questions.map(
            (relatedQuestion, i) =>
              this.renderRelatedQuestion(relatedQuestion, i)
          )}
        </ul>
      </aside>
    );
  }
}
