import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {Hidden} from '@/src/components/common/stencil-hidden';
import {randomID} from '@/src/utils/utils';
import {
  buildSmartSnippetQuestionsList as buildInsightSmartSnippetQuestionsList,
  SmartSnippetQuestionsList as InsightSmartSnippetQuestionsList,
  SmartSnippetQuestionsListState as InsightSmartSnippetQuestionsListState,
  Result,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless/insight';
import {Component, Prop, State, Element, h} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import ArrowRight from '../../../../images/arrow-right.svg';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {
  getQuestionPart,
  SmartSnippetSuggestionsAnswerAndSourceWrapper,
  SmartSnippetSuggestionsFooter,
  SmartSnippetSuggestionsQuestion,
  SmartSnippetSuggestionsQuestionWrapper,
  SmartSnippetSuggestionsWrapper,
} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/stencil-smart-snippet-suggestions-common';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-smart-snippet-suggestions',
  styleUrl: 'atomic-insight-smart-snippet-suggestions.pcss',
  shadow: true,
})
export class AtomicInsightSmartSnippetSuggestions
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public smartSnippetQuestionsList!: InsightSmartSnippetQuestionsList;
  @BindStateToController('smartSnippetQuestionsList')
  @State()
  public smartSnippetQuestionsListState!: InsightSmartSnippetQuestionsListState;
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

  private id!: string;

  public initialize() {
    this.id ||= randomID('atomic-smart-snippet-suggestions-');
    this.smartSnippetQuestionsList = buildInsightSmartSnippetQuestionsList(
      this.bindings.engine
    );
  }

  public render() {
    if (!this.smartSnippetQuestionsListState.questions.length) {
      return <Hidden></Hidden>;
    }

    return (
      <SmartSnippetSuggestionsWrapper
        headingLevel={this.headingLevel}
        i18n={this.bindings.i18n}
      >
        {this.smartSnippetQuestionsListState.questions.map(
          (relatedQuestion, i) => this.renderRelatedQuestion(relatedQuestion, i)
        )}
      </SmartSnippetSuggestionsWrapper>
    );
  }

  private renderRelatedQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return (
      <SmartSnippetSuggestionsQuestionWrapper
        expanded={relatedQuestion.expanded}
        key={relatedQuestion.questionAnswerId}
      >
        <SmartSnippetSuggestionsQuestion
          ariaControls={`${this.id}-${index}`}
          expanded={relatedQuestion.expanded}
          headingLevel={this.headingLevel}
          onClick={() => this.toggleQuestion(relatedQuestion)}
          question={relatedQuestion.question}
        >
          <atomic-icon
            icon={relatedQuestion.expanded ? ArrowDown : ArrowRight}
            part={getQuestionPart('icon', relatedQuestion.expanded)}
            class="mr-3 w-2.5 stroke-[1.25]"
          ></atomic-icon>
        </SmartSnippetSuggestionsQuestion>
        {relatedQuestion.expanded && this.renderAnswer(relatedQuestion, index)}
      </SmartSnippetSuggestionsQuestionWrapper>
    );
  }

  private renderAnswer(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return (
      <SmartSnippetSuggestionsAnswerAndSourceWrapper
        expanded={relatedQuestion.expanded}
        id={`${this.id}-${index}`}
      >
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
        {relatedQuestion.source &&
          this.renderSource(
            relatedQuestion.questionAnswerId,
            relatedQuestion.source
          )}
      </SmartSnippetSuggestionsAnswerAndSourceWrapper>
    );
  }

  private renderSource(questionAnswerId: string, source: Result) {
    return (
      <SmartSnippetSuggestionsFooter i18n={this.bindings.i18n}>
        <atomic-smart-snippet-source
          anchorAttributes={getAttributesFromLinkSlotContent(
            this.host,
            'source-anchor-attributes'
          )}
          onBeginDelayedSelectSource={() =>
            this.smartSnippetQuestionsList.beginDelayedSelectSource(
              questionAnswerId
            )
          }
          onCancelPendingSelectSource={() =>
            this.smartSnippetQuestionsList.cancelPendingSelectSource(
              questionAnswerId
            )
          }
          onSelectSource={() =>
            this.smartSnippetQuestionsList.selectSource(questionAnswerId)
          }
          source={source}
        ></atomic-smart-snippet-source>
      </SmartSnippetSuggestionsFooter>
    );
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

  private toggleQuestion(relatedQuestion: SmartSnippetRelatedQuestion) {
    if (relatedQuestion.expanded) {
      this.smartSnippetQuestionsList.collapse(relatedQuestion.questionAnswerId);
    } else {
      this.smartSnippetQuestionsList.expand(relatedQuestion.questionAnswerId);
    }
  }
}
