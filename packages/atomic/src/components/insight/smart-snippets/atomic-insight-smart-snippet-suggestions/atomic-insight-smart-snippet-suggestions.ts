import {NumberValue, Schema} from '@coveo/bueno';
import type {
  Result,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless/insight';
import {buildSmartSnippetQuestionsList} from '@coveo/headless/insight';
import {type CSSResultGroup, html, LitElement, nothing} from 'lit';
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
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import ArrowDown from '@/src/images/arrow-down.svg';
import ArrowRight from '@/src/images/arrow-right.svg';
import {randomID} from '@/src/utils/utils';
import '@/src/components/common/atomic-icon/atomic-icon';
import styles from './atomic-insight-smart-snippet-suggestions.tw.css';

/**
 * The `atomic-insight-smart-snippet-suggestions` component displays an accordion of questions related to the query with their corresponding answers.
 *
 * You can style the snippets by inserting a template element like this:
 * ```html
 * <atomic-insight-smart-snippet-suggestions>
 *   <template>
 *     <style>
 *       b {
 *         color: blue;
 *       }
 *     </style>
 *   </template>
 * </atomic-insight-smart-snippet-suggestions>
 * ```
 *
 * @internal
 *
 * @slot source-anchor-attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to anchor elements, overriding other attributes.
 * To be used exclusively in anchor elements, such as: `<a slot="source-anchor-attributes" target="_blank"></a>`.
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
@customElement('atomic-insight-smart-snippet-suggestions')
@bindings()
@withTailwindStyles
export class AtomicInsightSmartSnippetSuggestions
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  private static readonly propsSchema = new Schema({
    headingLevel: new NumberValue({min: 0, max: 5, required: false}),
  });

  static styles: CSSResultGroup = styles;

  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  @bindStateToController('smartSnippetQuestionsList')
  @state()
  public smartSnippetQuestionsListState!: SmartSnippetQuestionsListState;
  public smartSnippetQuestionsList!: SmartSnippetQuestionsList;

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

  private accordionId!: string;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({headingLevel: this.headingLevel}),
      AtomicInsightSmartSnippetSuggestions.propsSchema,
      false
    );
  }

  public initialize() {
    this.accordionId = randomID('atomic-insight-smart-snippet-suggestions-');
    this.smartSnippetQuestionsList = buildSmartSnippetQuestionsList(
      this.bindings.engine
    );
  }

  @errorGuard()
  @bindingGuard()
  public render() {
    return html`${when(
      this.smartSnippetQuestionsListState.questions.length > 0,
      () =>
        renderSuggestionsWrapper({
          props: {
            headingLevel: this.headingLevel,
            i18n: this.bindings.i18n,
          },
        })(html`
          ${this.smartSnippetQuestionsListState.questions.map(
            (relatedQuestion, i) =>
              this.renderRelatedQuestion(relatedQuestion, i)
          )}
        `),
      () => nothing
    )}`;
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
        ariaControls: `${this.accordionId}-${index}`,
        expanded: relatedQuestion.expanded,
        headingLevel: this.headingLevel,
        onClick: () => this.toggleQuestion(relatedQuestion),
        question: relatedQuestion.question,
      },
    })(html`
      <atomic-icon
        .icon=${relatedQuestion.expanded ? ArrowDown : ArrowRight}
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
        id: `${this.accordionId}-${index}`,
      },
    })(html`
      <atomic-smart-snippet-answer
        exportparts="answer"
        .htmlContent=${relatedQuestion.answer}
        .innerStyle=${this.computedSnippetStyle}
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

  private get computedSnippetStyle() {
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
