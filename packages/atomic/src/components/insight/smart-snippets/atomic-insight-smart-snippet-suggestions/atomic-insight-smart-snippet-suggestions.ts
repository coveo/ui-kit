import {Schema, StringValue} from '@coveo/bueno';
import type {
  Result,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless/insight';
import {
  buildSmartSnippetQuestionsList as buildInsightSmartSnippetQuestionsList,
  type SmartSnippetQuestionsList as InsightSmartSnippetQuestionsList,
  type SmartSnippetQuestionsListState as InsightSmartSnippetQuestionsListState,
} from '@coveo/headless/insight';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderAnswerAndSourceWrapper} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/answer-and-source-wrapper';
import {renderFooter} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/footer';
import {getQuestionPart} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/get-question-part';
import {renderQuestion} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/question';
import {renderQuestionWrapper} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/question-wrapper';
import {renderSuggestionsWrapper} from '@/src/components/common/smart-snippets/atomic-smart-snippet-suggestions/suggestions-wrapper';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/interfaces';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {randomID} from '@/src/utils/utils';
import ArrowDown from '../../../../images/arrow-down.svg';
import ArrowRight from '../../../../images/arrow-right.svg';

/**
 * @internal
 */
@customElement('atomic-insight-smart-snippet-suggestions')
@bindings()
@withTailwindStyles
export class AtomicInsightSmartSnippetSuggestions
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
  `;

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  @bindStateToController('smartSnippetQuestionsList')
  @state()
  public smartSnippetQuestionsListState!: InsightSmartSnippetQuestionsListState;
  public smartSnippetQuestionsList!: InsightSmartSnippetQuestionsList;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the "People also ask" heading over the snippets, from 1 to 5.
   */
  @property({reflect: true, type: Number, attribute: 'heading-level'})
  public headingLevel = 0;

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
  @property({type: String, attribute: 'snippet-style'}) snippetStyle?: string;

  private id!: string;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({headingLevel: this.headingLevel}),
      new Schema({
        headingLevel: new StringValue({required: false}),
      })
    );
  }

  public initialize() {
    this.id ||= randomID('atomic-smart-snippet-suggestions-');
    this.smartSnippetQuestionsList = buildInsightSmartSnippetQuestionsList(
      this.bindings.engine
    );
  }

  @errorGuard()
  protected render() {
    if (!this.smartSnippetQuestionsListState.questions.length) {
      return nothing;
    }

    return renderSuggestionsWrapper({
      props: {
        headingLevel: this.headingLevel,
        i18n: this.bindings.i18n,
      },
    })(html`
      ${this.smartSnippetQuestionsListState.questions.map(
        (relatedQuestion, i) => this.renderRelatedQuestion(relatedQuestion, i)
      )}
    `);
  }

  private renderRelatedQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return renderQuestionWrapper({
      props: {
        expanded: relatedQuestion.expanded,
        key: relatedQuestion.questionAnswerId,
      },
    })(html`
      ${this.renderQuestionButton(relatedQuestion, index)}
      ${when(relatedQuestion.expanded, () =>
        this.renderAnswer(relatedQuestion, index)
      )}
    `);
  }

  private renderQuestionButton(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return renderQuestion({
      props: {
        ariaControls: `${this.id}-${index}`,
        expanded: relatedQuestion.expanded,
        headingLevel: this.headingLevel,
        onClick: () => this.toggleQuestion(relatedQuestion),
        question: relatedQuestion.question,
      },
    })(html`
      <atomic-icon
        icon=${relatedQuestion.expanded ? ArrowDown : ArrowRight}
        part=${getQuestionPart('icon', relatedQuestion.expanded)}
        class="mr-3 w-2.5 stroke-[1.25]"
      ></atomic-icon>
    `);
  }

  private renderAnswer(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return renderAnswerAndSourceWrapper({
      props: {
        id: `${this.id}-${index}`,
      },
    })(html`
      <atomic-smart-snippet-answer
        exportparts="answer"
        .htmlContent=${relatedQuestion.answer}
        .innerStyle=${this.style}
        @selectInlineLink=${(e: CustomEvent) =>
          this.smartSnippetQuestionsList.selectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )}
        @beginDelayedSelectInlineLink=${(e: CustomEvent) =>
          this.smartSnippetQuestionsList.beginDelayedSelectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )}
        @cancelPendingSelectInlineLink=${(e: CustomEvent) =>
          this.smartSnippetQuestionsList.cancelPendingSelectInlineLink(
            relatedQuestion.questionAnswerId,
            e.detail
          )}
      ></atomic-smart-snippet-answer>
      ${when(relatedQuestion.source, () =>
        this.renderSource(
          relatedQuestion.questionAnswerId,
          relatedQuestion.source!
        )
      )}
    `);
  }

  private renderSource(questionAnswerId: string, source: Result) {
    return renderFooter({
      props: {
        i18n: this.bindings.i18n,
      },
    })(html`
      <atomic-smart-snippet-source
        .anchorAttributes=${getAttributesFromLinkSlotContent(
          this,
          'source-anchor-attributes'
        )}
        @beginDelayedSelectSource=${() =>
          this.smartSnippetQuestionsList.beginDelayedSelectSource(
            questionAnswerId
          )}
        @cancelPendingSelectSource=${() =>
          this.smartSnippetQuestionsList.cancelPendingSelectSource(
            questionAnswerId
          )}
        @selectSource=${() =>
          this.smartSnippetQuestionsList.selectSource(questionAnswerId)}
        .source=${source}
      ></atomic-smart-snippet-source>
    `);
  }

  private get style() {
    const styleTag =
      this.querySelector('template')?.content.querySelector('style');
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

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-smart-snippet-suggestions': AtomicInsightSmartSnippetSuggestions;
  }
}
