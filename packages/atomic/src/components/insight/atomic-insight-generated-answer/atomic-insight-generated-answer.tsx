import {
  SearchStatus as InsightSearchStatus,
  SearchStatusState as InsightSearchStatusState,
  buildGeneratedAnswer as buildInsightGeneratedAnswer,
  buildInteractiveCitation as buildInsightInteractiveCitation,
  buildSearchStatus as buildInsightSearchStatus,
  GeneratedAnswer as InsightGeneratedAnswer,
  GeneratedAnswerState as InsightGeneratedAnswerState,
} from '@coveo/headless/insight';
import {Component, Element, State, Prop, Watch} from '@stencil/core';
import {debounce} from '../../../utils/debounce-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {GeneratedAnswerCommon} from '../../common/generated-answer/generated-answer-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 * The `atomic-insight-generated-answer` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user.
 * For more information, see [About Relevance Generative Answering (RGA)](https://docs.coveo.com/en/n9de0370/)
 *
 * @slot no-answer-message - Lets you pass a custom sorry message when no answer is generated.
 *
 * @part container - The container displaying the generated answer.
 * @part header-label - The header of the generated answer container.
 * @part feedback-button - The "like" and "dislike" buttons.
 * @part toggle - The switch to toggle the visibility of the generated answer.
 * @part copy-button - The "Copy answer" button.
 * @part retry-container - The container for the "retry" section.
 * @part generated-text - The text of the generated answer.
 * @part citations-label - The header of the citations list.
 *
 * @part answer-code-block - The generated answer multi-line code blocks.
 * @part answer-emphasis - The generated answer emphasized text elements.
 * @part answer-inline-code - The generated answer inline code elements.
 * @part answer-heading-1 - The generated answer level 1 heading elements.
 * @part answer-heading-2 - The generated answer level 2 heading elements.
 * @part answer-heading-3 - The generated answer level 3 heading elements.
 * @part answer-heading-4 - The generated answer level 4 heading elements.
 * @part answer-heading-5 - The generated answer level 5 heading elements.
 * @part answer-heading-6 - The generated answer level 6 heading elements.
 * @part answer-list-item - The generated answer list item elements for both ordered and unordered lists.
 * @part answer-ordered-list - The generated answer ordered list elements.
 * @part answer-paragraph - The generated answer paragraph elements.
 * @part answer-quote-block - The generated answer quote block elements.
 * @part answer-unordered-list - The generated answer unordered list elements.
 * @part answer-strong - The generated answer strong text elements.
 * @part answer-table - The generated answer table elements.
 * @part answer-table-container - The generated answer table container elements.
 * @part answer-table-content - The generated answer table content cell elements.
 * @part answer-table-header - The generated answer table header cell elements.
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

  private readonly DEFAULT_COLLAPSED_HEIGHT = 16;
  private readonly MAX_COLLAPSED_HEIGHT = 32;
  private readonly MIN_COLLAPSED_HEIGHT = 9;
  private readonly REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS = ['filetype'];

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
   * Whether to render a toggle button that lets the user hide or show the answer.
   * @default false
   */
  @Prop() withToggle?: boolean;

  /**
   * Whether to allow the answer to be collapsed when the text is taller than 250px.
   * @default false
   */
  @Prop() collapsible?: boolean;

  /**
   * The maximum height (in rem units) of the answer when collapsed.
   *
   */
  @Prop() maxCollapsedHeight = this.DEFAULT_COLLAPSED_HEIGHT;

  /**
   * @internal
   * The unique identifier of the answer configuration to use to generate the answer.
   */
  @Prop() answerConfigurationId?: string;

  /**
   * A list of fields to include with the citations used to generate the answer.
   */
  @Prop() fieldsToIncludeInCitations?: string;

  /**
   * Option to disable citation anchoring.
   * @default false
   */
  @Prop() disableCitationAnchoring?: boolean;

  @AriaLiveRegion('generated-answer')
  protected ariaMessage!: string;

  private generatedAnswerCommon!: GeneratedAnswerCommon;
  private fullAnswerHeight?: number;

  public initialize() {
    this.generatedAnswerCommon = new GeneratedAnswerCommon({
      host: this.host,
      withToggle: this.withToggle,
      collapsible: this.collapsible,
      disableCitationAnchoring: this.disableCitationAnchoring,
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
          contentFormat: ['text/markdown', 'text/plain'],
        },
      },
      ...(this.answerConfigurationId && {
        answerConfigurationId: this.answerConfigurationId,
      }),
      fieldsToIncludeInCitations: this.getCitationFields(),
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
    const answerHeight = this.host?.shadowRoot
      ?.querySelector('[part="generated-text"]')
      ?.getBoundingClientRect().height;

    if (answerHeight) {
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      this.fullAnswerHeight = answerHeight / rootFontSize;

      this.updateAnswerHeight();
    }
  }

  private getAnswerContainer() {
    return this.host?.shadowRoot?.querySelector('[part="generated-container"]');
  }

  private getAnswerFooter() {
    return this.host?.shadowRoot?.querySelector(
      '[part="generated-answer-footer"]'
    );
  }

  private getCitationFields() {
    return (this.fieldsToIncludeInCitations ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0)
      .concat(this.REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS)
  }

  private validateMaxCollapsedHeight(): number {
    const isValid =
      this.maxCollapsedHeight >= this.MIN_COLLAPSED_HEIGHT &&
      this.maxCollapsedHeight <= this.MAX_COLLAPSED_HEIGHT;

    if (!isValid) {
      console.warn(
        `max-collapsed-height (${this.maxCollapsedHeight}rem) is out of the valid range (${this.MIN_COLLAPSED_HEIGHT}rem - ${this.MAX_COLLAPSED_HEIGHT}rem). Falling back to default value (${this.DEFAULT_COLLAPSED_HEIGHT}rem).`
      );
    }

    return isValid ? this.maxCollapsedHeight : this.DEFAULT_COLLAPSED_HEIGHT;
  }

  private setCSSVariable(variableName: string, value: string) {
    const container = this.getAnswerContainer();
    if (container) {
      (container as HTMLElement).style.setProperty(variableName, value);
    }
  }

  private updateAnswerHeight() {
    const container = this.getAnswerContainer();
    const footer = this.getAnswerFooter();
    const maxHeight = this.validateMaxCollapsedHeight();

    if (!container || !footer) {
      return;
    }

    if (this.fullAnswerHeight! > maxHeight) {
      this.setCSSVariable('--atomic-crga-collapsed-height', `${maxHeight}rem`);
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
