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
import {Component, Element, State, Prop, Watch} from '@stencil/core';
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
 * @part rephrase-button-label - The label of the rephrase button.
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
  private resizeObserver?: ResizeObserver;

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

  @State()
  isCollapsed = false;

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
  private fullAnswerHeight?: number;
  private maxCollapsedHeight = 250;

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
      getIsCollapsed: () => this.isCollapsed,
      setIsCollapsed: this.setIsCollapsed,
      buildInteractiveCitation: (props) =>
        buildInteractiveCitation(this.bindings.engine, props),
    });
    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.generatedAnswerCommon.data.isVisible,
        responseFormat: {
          answerStyle: this.answerStyle,
        },
      },
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.generatedAnswerCommon.insertFeedbackModal();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.adaptAnswerHeight());
      this.resizeObserver.observe(this.host);
    }
  }

  @Watch('isCollapsed')
  public updateAnswerCollapsed() {
    const container = this.getAnswerContainer();

    if (!container) {
      return;
    }

    this.toggleClass(container, 'answer-collapsed', this.isCollapsed);
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
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
    this.setIsCollapsed(true);
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

  private setIsCollapsed = (isCollapsed: boolean) => {
    this.isCollapsed = isCollapsed;
  };

  private toggleClass(element: Element, className: string, condition: boolean) {
    if (condition) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  private adaptAnswerHeight() {
    if (this.isShowButtonDisplayed()) {
      this.fullAnswerHeight = this.host?.shadowRoot
        ?.querySelector('p[part="generated-text"')
        ?.getBoundingClientRect().height;
      this.updateAnswerHeight();
    }
  }

  private getShowButton() {
    return this.host?.shadowRoot?.querySelector('[part="answer-show-button"');
  }

  private getAnswerContainer() {
    return this.host?.shadowRoot?.querySelector('[part="generated-container"');
  }

  private getAnswerFooter() {
    return this.host?.shadowRoot?.querySelector(
      '[part="generated-answer-footer"'
    );
  }

  private updateAnswerHeight() {
    const container = this.getAnswerContainer();
    const footer = this.getAnswerFooter();
    const showButton = this.getShowButton();

    if (!container || !showButton || !footer) {
      return;
    }

    if (this.fullAnswerHeight! > this.maxCollapsedHeight) {
      this.toggleClass(container, 'answer-collapsed', this.isCollapsed);
      this.toggleClass(showButton, 'show-button-hidden', false);
    } else {
      this.toggleClass(container, 'answer-collapsed', false);
      this.toggleClass(footer, 'show-button-hidden', true);
    }
  }

  private isShowButtonDisplayed() {
    const showButton = this.getShowButton();
    return (
      showButton &&
      showButton.getBoundingClientRect().width > 0 &&
      showButton.getBoundingClientRect().height > 0
    );
  }

  public render() {
    return this.generatedAnswerCommon.render();
  }
}
