import {
  buildSmartSnippetQuestionsList,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from '@coveo/headless';
import {Component, Prop, State, Element} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/utils';
import {getAttributesFromLinkSlot} from '../../../common/item-link/attributes-slot';
import {SmartSnippetSuggestionCommon} from '../../../common/smart-snippets/atomic-smart-snippet-suggestions/smart-snippet-suggestions-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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

  private smartSnippetSuggestionListCommon!: SmartSnippetSuggestionCommon;

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

    this.smartSnippetSuggestionListCommon = new SmartSnippetSuggestionCommon({
      id: this.id,
      getSourceAnchorAttributes: () =>
        getAttributesFromLinkSlot(this.host, 'source-anchor-attributes'),
      getHost: () => this.host,
      getBindings: () => this.bindings,
      getHeadingLevel: () => this.headingLevel,
      getState: () => this.smartSnippetQuestionsListState,
      getQuestionsList: () => this.smartSnippetQuestionsList,
      getSnippetStyle: () => this.snippetStyle,
    });

    this.smartSnippetSuggestionListCommon.hideDuringRender(true);
    this.bindings.store.waitUntilAppLoaded(() => {
      this.smartSnippetSuggestionListCommon.hideDuringRender(false);
    });
  }

  public renderRelatedQuestion(
    relatedQuestion: SmartSnippetRelatedQuestion,
    index: number
  ) {
    return this.smartSnippetSuggestionListCommon.renderRelatedQuestion(
      relatedQuestion,
      index
    );
  }

  public render() {
    return this.smartSnippetSuggestionListCommon.render();
  }
}
