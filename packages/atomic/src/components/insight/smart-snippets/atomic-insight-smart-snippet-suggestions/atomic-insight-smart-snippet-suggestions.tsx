import {
  buildSmartSnippetQuestionsList as buildInsightSmartSnippetQuestionsList,
  SmartSnippetQuestionsList as InsightSmartSnippetQuestionsList,
  SmartSnippetQuestionsListState as InsightSmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion as InsightSmartSnippetRelatedQuestion,
} from '@coveo/headless/insight';
import {Component, Prop, State, Element} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
  BindStateToController,
} from '../../../../utils/initialization-utils';
import {randomID} from '../../../../utils/stencil-utils';
import {SmartSnippetSuggestionCommon} from '../../../common/smart-snippets/atomic-smart-snippet-suggestions/smart-snippet-suggestions-common';
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

  private id!: string;

  public initialize() {
    this.id ||= randomID('atomic-smart-snippet-suggestions-');
    this.smartSnippetQuestionsList = buildInsightSmartSnippetQuestionsList(
      this.bindings.engine
    );

    this.smartSnippetSuggestionListCommon = new SmartSnippetSuggestionCommon({
      id: this.id,
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
    relatedQuestion: InsightSmartSnippetRelatedQuestion,
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
