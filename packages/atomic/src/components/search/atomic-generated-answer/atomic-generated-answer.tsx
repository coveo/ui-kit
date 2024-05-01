import {
  SearchStatus,
  SearchStatusState,
  buildSearchStatus,
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerStyle,
  buildInteractiveCitation,
} from '@coveo/headless';
import {Component, Element, State, Prop} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {GeneratedAnswerCommon} from '../../common/generated-answer/generated-answer-common';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-generated-answer` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user.
 * For more information, see [About Relevance Generative Answering (RGA)](https://docs.coveo.com/en/n9de0370/)
 *
 * @part container - The container displaying the generated answer.
 * @part header-label - The header of the generated answer container.
 * @part feedback-button - The "like" and "dislike" buttons.
 * @part toggle - The switch to toggle the visibility of the generated answer.
 * @part copy-button - The "Copy answer" button.
 * @part retry-container - The container for the "retry" section.
 * @part generated-text - The text of the generated answer.
 * @part citations-label - The header of the citations list.
 * @part rephrase-label - The header of the rephrase options.
 * @part rephrase-buttons - The container of the rephrase buttons section.
 * @part rephrase-button - The button for each of the rephrase options (step-by-step instructions, bulleted list, and summary).
 * @part rephrase-buttons-container - The container of the rephrase buttons.
 * @part rephrase-button-label - The label of the rephrase button.
 *
 * @part answer-heading-1 - The generated answer level 1 heading elements.
 * @part answer-heading-2 - The generated answer level 2 heading elements.
 * @part answer-heading-3 - The generated answer level 3 heading elements.
 * @part answer-heading-4 - The generated answer level 4 heading elements.
 * @part answer-heading-5 - The generated answer level 5 heading elements.
 * @part answer-heading-6 - The generated answer level 6 heading elements.
 *
 * @part citation - The link that allows the user to navigate to the item.
 * @part citation-popover - The pop-up that shows an item preview when the user hovers over the citation.
 * @part citation-index - The content of the citation item.
 */
@Component({
  tag: 'atomic-generated-answer',
  styleUrl: 'atomic-generated-answer.pcss',
  shadow: true,
})
export class AtomicGeneratedAnswer implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public generatedAnswer!: GeneratedAnswer;
  public searchStatus!: SearchStatus;

  @BindStateToController('generatedAnswer', {
    onUpdateCallbackMethod: 'onGeneratedAnswerStateUpdate',
  })
  @State()
  private generatedAnswerState!: GeneratedAnswerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;

  @State()
  public error!: Error;

  @Element() private host!: HTMLElement;

  @State()
  copied = false;

  @State()
  copyError = false;

  /**
   * The answer style to apply when the component first loads.
   * Options:
   *   - `default`: Generate the answer without specific formatting instructions.
   *   - `bullet`: Generate the answer as a bulleted list.
   *   - `step`: Generate the answer as step-by-step instructions.
   *   - `concise`: Generate the answer as briefly as possible.
   */
  @Prop() answerStyle: GeneratedAnswerStyle = 'default';

  @AriaLiveRegion('generated-answer')
  protected ariaMessage!: string;

  private generatedAnswerCommon!: GeneratedAnswerCommon;

  public initialize() {
    this.generatedAnswerCommon = new GeneratedAnswerCommon({
      host: this.host,
      getGeneratedAnswer: () => this.generatedAnswer,
      getGeneratedAnswerState: () => this.generatedAnswerState,
      getSearchStatusState: () => this.searchStatusState,
      getBindings: () => this.bindings,
      getCopied: () => this.copied,
      setCopied: this.setCopied,
      getCopyError: () => this.copyError,
      setCopyError: this.setCopyError,
      setAriaMessage: this.setAriaMessage,
      buildInteractiveCitation: (props) =>
        buildInteractiveCitation(this.bindings.engine, props),
    });
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.generatedAnswerCommon.data.isVisible,
        responseFormat: {
          answerStyle: this.answerStyle,
          contentFormat: ['text/markdown', 'text/plain'],
        },
      },
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.generatedAnswerCommon.insertFeedbackModal();
  }

  // @ts-expect-error: This function is used by BindStateToController.
  private onGeneratedAnswerStateUpdate = () => {
    if (
      this.generatedAnswerState.isVisible !==
      this.generatedAnswerCommon?.data?.isVisible
    ) {
      this.generatedAnswerCommon.data = {
        ...this.generatedAnswerCommon.data,
        isVisible: this.generatedAnswerState.isVisible,
      };
      this.generatedAnswerCommon.writeStoredData(
        this.generatedAnswerCommon.data
      );
    }

    this.setAriaMessage(this.generatedAnswerCommon.getGeneratedAnswerStatus());
  };

  private setCopied = (isCopied: boolean) => {
    this.copied = isCopied;
  };

  private setCopyError = (copyError: boolean) => {
    this.copyError = copyError;
  };

  private setAriaMessage = (message: string) => {
    this.ariaMessage = message;
  };

  public render() {
    return this.generatedAnswerCommon.render();
  }
}
