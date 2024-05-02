import {Component, Element, State, Prop, Watch} from '@stencil/core';
import {
  InsightSearchStatus,
  InsightSearchStatusState,
  buildInsightGeneratedAnswer,
  buildInsightInteractiveCitation,
  buildInsightSearchStatus,
  InsightGeneratedAnswer,
  InsightGeneratedAnswerState,
  InsightGeneratedAnswerStyle,
} from '..';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {debounce} from '../../../utils/debounce-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {GeneratedAnswerCommon} from '../../common/generated-answer/generated-answer-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 * The `atomic-insight-generated-answer` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user.
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
 * @part rephrase-button - The button for each of the rephrase options (step-by-step instructions, bulleted list, and summary).
 *
 * @part citation - The link that allows the user to navigate to the item.
 * @part citation-popover - The pop-up that shows an item preview when the user hovers over the citation.
 */
@Component({
  tag: 'atomic-insight-generated-answer',
  styleUrl: 'atomic-insight-generated-answer.pcss',
  shadow: true,
})
export class AtomicInsightGeneratedAnswer
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public generatedAnswer!: InsightGeneratedAnswer;
  public searchStatus!: InsightSearchStatus;
  private resizeObserver?: ResizeObserver;

  @BindStateToController('generatedAnswer', {
    onUpdateCallbackMethod: 'onGeneratedAnswerStateUpdate',
  })
  @State()
  private generatedAnswerState!: InsightGeneratedAnswerState;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: InsightSearchStatusState;

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
  @Prop() answerStyle: InsightGeneratedAnswerStyle = 'default';

  /**
   * Whether to allow the answer to be collapsed when the text is taller than 250px.
   */
  @Prop() collapsible?: boolean;

  @AriaLiveRegion('generated-answer')
  protected ariaMessage!: string;

  private generatedAnswerCommon!: GeneratedAnswerCommon;
  private fullAnswerHeight?: number;
  private maxCollapsedHeight = 250;

  public initialize() {
    this.generatedAnswerCommon = new GeneratedAnswerCommon({
      host: this.host,
      collapsible: this.collapsible,
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
        buildInsightInteractiveCitation(this.bindings.engine, props),
    });
    this.generatedAnswer = buildInsightGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.generatedAnswerCommon.data.isVisible,
        responseFormat: {
          answerStyle: this.answerStyle,
        },
      },
    });
    this.searchStatus = buildInsightSearchStatus(this.bindings.engine);
    this.generatedAnswerCommon.insertFeedbackModal();

    if (window.ResizeObserver && this.collapsible) {
      const debouncedAdaptAnswerHeight = debounce(
        () => this.adaptAnswerHeight(),
        100
      );
      this.resizeObserver = new ResizeObserver(debouncedAdaptAnswerHeight);
      this.resizeObserver.observe(this.host);
    }
  }

  @Watch('generatedAnswerState')
  public updateAnswerCollapsed(
    newState: InsightGeneratedAnswerState,
    oldState: InsightGeneratedAnswerState
  ) {
    const newExpanded = newState.expanded;
    const oldExpanded = oldState ? oldState.expanded : undefined;

    if (newExpanded !== oldExpanded) {
      const container = this.getAnswerContainer();

      if (!container) {
        return;
      }

      this.toggleClass(container, 'answer-collapsed', !newExpanded);
    }
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

  private toggleClass(element: Element, className: string, condition: boolean) {
    element.classList.toggle(className, condition);
  }

  private adaptAnswerHeight() {
    this.fullAnswerHeight = this.host?.shadowRoot
      ?.querySelector('[part="generated-text"]')
      ?.getBoundingClientRect().height;
    this.updateAnswerHeight();
  }

  private getAnswerContainer() {
    return this.host?.shadowRoot?.querySelector('[part="generated-container"]');
  }

  private getAnswerFooter() {
    return this.host?.shadowRoot?.querySelector(
      '[part="generated-answer-footer"]'
    );
  }

  private updateAnswerHeight() {
    const container = this.getAnswerContainer();
    const footer = this.getAnswerFooter();

    if (!container || !footer) {
      return;
    }

    if (this.fullAnswerHeight! > this.maxCollapsedHeight) {
      this.toggleClass(
        container,
        'answer-collapsed',
        !this.generatedAnswerState.expanded
      );
      this.toggleClass(footer, 'is-collapsible', true);
      this.toggleClass(
        footer,
        'generating-label-visible',
        this.generatedAnswerState.isStreaming
      );
    } else {
      this.toggleClass(container, 'answer-collapsed', false);
      this.toggleClass(footer, 'is-collapsible', false);
      this.toggleClass(footer, 'generating-label-visible', false);
    }
  }

  public render() {
    return this.generatedAnswerCommon.render();
  }
}
