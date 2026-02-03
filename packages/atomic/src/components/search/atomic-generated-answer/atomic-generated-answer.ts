import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchStatus,
  buildTabManager,
  type GeneratedAnswer,
  type GeneratedAnswerState,
  type GeneratedAnswerWithFollowUps,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement, nothing, type PropertyValueMap} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {GeneratedAnswerController} from '@/src/components/common/generated-answer/generated-answer-controller';
import {renderAnswerContent} from '@/src/components/common/generated-answer/render-answer-content';
import {renderCitations} from '@/src/components/common/generated-answer/render-citations';
import {renderCustomNoAnswerMessage} from '@/src/components/common/generated-answer/render-custom-no-answer-message';
import {renderDisclaimer} from '@/src/components/common/generated-answer/render-disclaimer';
import {renderFeedbackAndCopyButtons} from '@/src/components/common/generated-answer/render-feedback-and-copy-buttons';
import {renderFollowUpInput} from '@/src/components/common/generated-answer/render-follow-up-input';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {createLegacyArrayStringConverter} from '@/src/converters/legacy-array-string-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {debounce} from '@/src/utils/debounce-utils';
import {getNamedSlotContent} from '@/src/utils/slot-utils';
import {shouldDisplayOnCurrentTab} from '@/src/utils/tab-utils';
import atomicGeneratedAnswerStyles from './atomic-generated-answer.tw.css.js';

/**
 * The `atomic-generated-answer` component uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user.
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
@customElement('atomic-generated-answer')
@bindings()
@withTailwindStyles
export class AtomicGeneratedAnswer
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles = [atomicGeneratedAnswerStyles];
  private static readonly propsSchema = new Schema({
    maxCollapsedHeight: new NumberValue({
      min: 9,
      max: 32,
      required: false,
    }),
  });

  // TODO V4 (KIT-5306): Remove converter and use arrayConverter directly.
  private static readonly fieldsToIncludeInCitationsConverter =
    createLegacyArrayStringConverter((value) => {
      console.warn(
        `Starting from Atomic v4, the "fields-to-include-in-citations" property will only accept an array of strings. Using a comma-separated string value ("${value}") is now deprecated. Please update the value to be a JSON array. For example: fields-to-include-in-citations='["fieldA","fieldB"]'`
      );
    });

  private readonly DEFAULT_COLLAPSED_HEIGHT = 16;
  private readonly MAX_COLLAPSED_HEIGHT = 32;
  private readonly MIN_COLLAPSED_HEIGHT = 9;
  private readonly REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS = ['filetype'];

  private resizeObserver?: ResizeObserver;
  private fullAnswerHeight?: number;
  private controller!: GeneratedAnswerController;

  /**
   * Whether to render a toggle button that lets the user hide or show the answer.
   */
  @property({
    type: Boolean,
    attribute: 'with-toggle',
    converter: booleanConverter,
  })
  withToggle = false;

  /**
   * Whether to allow the answer to be collapsed when the text is taller than the specified `--atomic-crga-collapsed-height` value (16rem by default).
   */
  @property({type: Boolean, converter: booleanConverter})
  collapsible = false;

  /**
   * The maximum height (in rem units) of the answer when collapsed.
   */
  @property({type: Number, attribute: 'max-collapsed-height'})
  maxCollapsedHeight = this.DEFAULT_COLLAPSED_HEIGHT;

  /**
   * The unique identifier of the answer configuration to use to generate the answer.
   */
  @property({type: String, attribute: 'answer-configuration-id'})
  answerConfigurationId?: string;

  /**
   * The unique identifier of the agent configuration to use to generate the answer.
   */
  @property({type: String, attribute: 'agent-id'})
  agentId?: string;

  /**
   * A list of fields to include with the citations used to generate the answer.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-generated-answer fields-to-include-in-citations='["fieldA", "fieldB"]'></atomic-generated-answer>
   * ```
   */
  @property({
    type: String,
    attribute: 'fields-to-include-in-citations',
    converter: AtomicGeneratedAnswer.fieldsToIncludeInCitationsConverter,
  })
  fieldsToIncludeInCitations?: string;

  /**
   * Whether to disable citation anchoring.
   */
  @property({
    type: Boolean,
    attribute: 'disable-citation-anchoring',
    converter: booleanConverter,
  })
  disableCitationAnchoring = false;

  /**
   * Whether to make the generated answer content scrollable.
   * When enabled, the content area will have a maximum height and allow scrolling through previous answers.
   */
  @property({
    type: Boolean,
    attribute: 'scrollable',
    converter: booleanConverter,
  })
  scrollable = false;

  /**
   * Whether to display a button that lets users hide the previous follow-up questions after expanding them.
   */
  @property({
    type: Boolean,
    attribute: 'hide-previous-answers',
    converter: booleanConverter,
  })
  hidePreviousAnswers = false;

  /**
   * Whether to make the follow-up input sticky.
   * When enabled, the input will stick to the bottom of the viewport when scrolling up.
   */
  @property({
    type: Boolean,
    attribute: 'sticky-input',
    converter: booleanConverter,
  })
  stickyInput = false;

  /**
   * The tabs on which the generated answer can be displayed. This property should not be used at the same time as `tabs-excluded`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-generated-answer tabs-included='["tabIDA", "tabIDB"]'></atomic-generated-answer>
   * ```
   * If you don't set this property, the generated answer can be displayed on any tab. Otherwise, the generated answer can only be displayed on the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-included',
    converter: arrayConverter,
  })
  tabsIncluded: string[] = [];

  /**
   * The tabs on which this generated answer must not be displayed. This property should not be used at the same time as `tabs-included`.
   *
   * Set this property as a stringified JSON array, for example:
   * ```html
   *  <atomic-generated-answer tabs-excluded='["tabIDA", "tabIDB"]'></atomic-generated-answer>
   * ```
   * If you don't set this property, the generated answer can be displayed on any tab. Otherwise, the generated answer won't be displayed on any of the specified tabs.
   */
  @property({
    type: Array,
    attribute: 'tabs-excluded',
    converter: arrayConverter,
  })
  tabsExcluded: string[] = [];

  @state()
  bindings!: Bindings;

  @state()
  public error!: Error;

  @bindStateToController('generatedAnswer', {
    onUpdateCallbackMethod: 'onGeneratedAnswerStateUpdate',
  })
  @state()
  private generatedAnswerState!: GeneratedAnswerState;
  public generatedAnswer!: GeneratedAnswer | GeneratedAnswerWithFollowUps;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;
  public searchStatus!: SearchStatus;

  @bindStateToController('tabManager')
  @state()
  public tabManagerState!: TabManagerState;
  public tabManager!: TabManager;

  @state()
  private copied = false;

  @state()
  private copyError = false;

  @state()
  private followUpInputValue = '';

  @state()
  private followUpPending = false;

  @state()
  private previousAnswersCollapsed = true;

  @state()
  private initialQuery = '';

  private ariaMessage = new AriaLiveRegionController(this, 'generated-answer');

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({maxCollapsedHeight: this.maxCollapsedHeight}),
      AtomicGeneratedAnswer.propsSchema,
      // TODO: V4: KIT-5197 - Remove skipValidation flag
      false
    );
  }

  public initialize() {
    if (this.tabsIncluded.length > 0 && this.tabsExcluded.length > 0) {
      console.warn(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    }

    this.controller = new GeneratedAnswerController(this, {
      withToggle: this.withToggle,
      getGeneratedAnswer: () => this.generatedAnswer,
      getGeneratedAnswerState: () => this.generatedAnswerState,
      getSearchStatusState: () => this.searchStatusState,
      getBindings: () => this.bindings,
    });

    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.controller.data.isVisible,
        responseFormat: {
          contentFormat: ['text/markdown', 'text/plain'],
        },
      },
      ...(this.answerConfigurationId && {
        answerConfigurationId: this.answerConfigurationId,
      }),
      ...(this.agentId && {
        agentId: this.agentId,
      }),
      fieldsToIncludeInCitations: this.getCitationFields(),
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.controller.insertFeedbackModal();

    if (window.ResizeObserver && this.collapsible) {
      const debouncedAdaptAnswerHeight = debounce(
        () => this.adaptAnswerHeight(),
        100
      );
      this.resizeObserver = new ResizeObserver(debouncedAdaptAnswerHeight);
      this.resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected willUpdate(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('tabManagerState' as keyof this)) {
      const oldValue = changedProperties.get('tabManagerState' as keyof this) as
        | TabManagerState
        | undefined;
      if (oldValue && this.tabManagerState?.activeTab !== oldValue?.activeTab) {
        if (
          !shouldDisplayOnCurrentTab(
            this.tabsIncluded,
            this.tabsExcluded,
            this.tabManagerState?.activeTab
          )
        ) {
          this.generatedAnswer.disable();
        } else {
          this.generatedAnswer.enable();
        }
      }
    }

    if (changedProperties.has('generatedAnswerState' as keyof this)) {
      const oldState = changedProperties.get(
        'generatedAnswerState' as keyof this
      ) as GeneratedAnswerState | undefined;
      if (
        oldState &&
        this.generatedAnswerState?.expanded !== oldState?.expanded
      ) {
        const container = this.getAnswerContainer();
        if (container) {
          this.toggleClass(
            container,
            'answer-collapsed',
            !this.generatedAnswerState.expanded
          );
        }
      }
    }
  }

  private canAskFollowUp(): this is {
    generatedAnswer: GeneratedAnswerWithFollowUps;
  } {
    return 'askFollowUp' in this.generatedAnswer;
  }

  private handleFollowUpInputChange = (value: string) => {
    this.followUpInputValue = value;
  };

  private handleAskFollowUp = async (query: string) => {
    if (this.canAskFollowUp()) {
      this.followUpPending = true;
      this.previousAnswersCollapsed = true;
      this.requestUpdate('previousAnswersCollapsed');
      try {
        const result = await this.generatedAnswer.askFollowUp(query);
        return result;
      } finally {
        this.followUpPending = false;
      }
    }
  };

  private handleClearFollowUpInput = () => {
    this.followUpInputValue = '';
  };

  private handleTogglePreviousAnswers = () => {
    this.previousAnswersCollapsed = false;
    this.requestUpdate('previousAnswersCollapsed');
  };

  private handleHidePreviousAnswers = () => {
    this.previousAnswersCollapsed = true;
    this.requestUpdate('previousAnswersCollapsed');
  };

  private isAnyFollowUpAnswerStreaming(): boolean {
    if (!this.canAskFollowUp()) {
      return false;
    }
    const followUpAnswers = this.generatedAnswer.state.followUpAnswers;
    return (
      followUpAnswers?.answers?.some((answer) => answer.isStreaming) ?? false
    );
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (
      !shouldDisplayOnCurrentTab(
        this.tabsIncluded,
        this.tabsExcluded,
        this.tabManagerState?.activeTab
      )
    ) {
      return nothing;
    }

    const contentClasses =
      'mx-auto mt-0 mb-4 border border-neutral shadow-lg bg-background rounded-lg text-on-background';

    if (this.hasNoAnswerGenerated) {
      if (
        this.generatedAnswerState?.cannotAnswer &&
        this.hasCustomNoAnswerMessage
      ) {
        return html`
          <div>
            <aside
              class=${contentClasses}
              part="container"
              aria-label=${this.bindings.i18n.t('generated-answer-title')}
            >
              <article>${this.renderCustomNoAnswerMessageWrapper()}</article>
            </aside>
          </div>
        `;
      }
      return nothing;
    }

    return html`
      <div>
        <aside
          class=${contentClasses}
          part="container"
          aria-label=${this.bindings.i18n.t('generated-answer-title')}
        >
          <article>${this.renderContent()}</article>
          ${this.isAnswerVisible ? this.renderFollowUpInput() : nothing}
          ${this.isAnswerVisible ? this.renderDisclaimer() : nothing}
        </aside>
      </div>
    `;
  }

  // Used by bindStateToController decorator via onUpdateCallbackMethod option
  public onGeneratedAnswerStateUpdate = () => {
    // Capture the initial query when the first answer is generated
    if (
      !this.initialQuery &&
      (this.generatedAnswerState.isLoading ||
        this.generatedAnswerState.isStreaming ||
        this.generatedAnswerState.isAnswerGenerated)
    ) {
      this.initialQuery = this.bindings.engine.state.query?.q ?? '';
    }

    if (
      this.generatedAnswerState.isVisible !== this.controller.data.isVisible
    ) {
      this.controller.data = {
        ...this.controller.data,
        isVisible: this.generatedAnswerState.isVisible,
      };
      this.controller.writeStoredData(this.controller.data);
    }

    this.ariaMessage.message = this.controller.getGeneratedAnswerStatus();
  };

  private get hasRetryableError() {
    return this.controller.hasRetryableError;
  }

  private get hasNoAnswerGenerated() {
    return this.controller.hasNoAnswerGenerated;
  }

  private get isAnswerVisible() {
    return this.controller.isAnswerVisible;
  }

  private get toggleTooltip() {
    return this.controller.getToggleTooltip();
  }

  private get copyToClipboardTooltip() {
    return this.controller.getCopyToClipboardTooltip(
      this.copied,
      this.copyError
    );
  }

  private get hasCustomNoAnswerMessage() {
    return getNamedSlotContent(this, 'no-answer-message').length > 0;
  }

  private async copyToClipboard(answer: string) {
    await this.controller.copyToClipboard(
      answer,
      () => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      },
      () => {
        this.copyError = true;
        setTimeout(() => {
          this.copyError = false;
        }, 2000);
      }
    );
  }

  private clickOnShowButton() {
    this.controller.clickOnShowButton();
  }

  private getCitationFields() {
    // Defensive: handle both string and array for backward compatibility
    // TODO V4 (KIT-5306): remove string handling
    let fields: string[] = [];
    if (Array.isArray(this.fieldsToIncludeInCitations)) {
      fields = this.fieldsToIncludeInCitations;
    } else if (typeof this.fieldsToIncludeInCitations === 'string') {
      fields = this.fieldsToIncludeInCitations
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    }
    return fields.concat(this.REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS);
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

  private toggleClass(element: Element, className: string, condition: boolean) {
    element.classList.toggle(className, condition);
  }

  private adaptAnswerHeight() {
    const answerHeight = this.shadowRoot
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
    return this.shadowRoot?.querySelector('[part="generated-container"]');
  }

  private getAnswerFooter() {
    return this.shadowRoot?.querySelector('[part="generated-answer-footer"]');
  }

  private setCSSVariable(variableName: string, value: string) {
    const container = this.getAnswerContainer();
    if (container) {
      (container as HTMLElement).style.setProperty(variableName, value);
    }
  }

  private updateAnswerHeight() {
    const container = this.getAnswerContainer() as HTMLElement;
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

  private clickDislike() {
    this.controller.clickDislike();
  }

  private clickLike() {
    this.controller.clickLike();
  }

  private renderCitationsList() {
    const {citations} = this.generatedAnswerState ?? {};

    return renderCitations({
      props: {
        citations,
        i18n: this.bindings.i18n,
        buildInteractiveCitation: (citation) =>
          buildInteractiveCitation(this.bindings.engine, {
            options: {citation},
          }),
        logCitationHover: (citationId, citationHoverTimeMs) => {
          this.generatedAnswer?.logCitationHover(
            citationId,
            citationHoverTimeMs
          );
        },
        disableCitationAnchoring: this.disableCitationAnchoring,
      },
    });
  }

  private renderFeedbackAndCopyButtonsWrapper() {
    return renderFeedbackAndCopyButtons({
      props: {
        i18n: this.bindings.i18n,
        generatedAnswerState: this.generatedAnswerState,
        copied: this.copied,
        copyError: this.copyError,
        getCopyToClipboardTooltip: () => this.copyToClipboardTooltip,
        onClickLike: () => this.clickLike(),
        onClickDislike: () => this.clickDislike(),
        onCopyToClipboard: (answer) => this.copyToClipboard(answer),
      },
    });
  }

  private renderContent() {
    return renderAnswerContent({
      props: {
        i18n: this.bindings.i18n,
        generatedAnswerState: this.generatedAnswerState,
        isAnswerVisible: this.isAnswerVisible,
        hasRetryableError: this.hasRetryableError,
        toggleTooltip: this.toggleTooltip,
        withToggle: this.withToggle,
        collapsible: this.collapsible,
        query: this.bindings.engine.state.query?.q ?? '',
        initialQuery: this.initialQuery,
        agentId: this.agentId,
        followUpAnswers: this.canAskFollowUp()
          ? this.generatedAnswer.state.followUpAnswers
          : undefined,
        renderFeedbackAndCopyButtonsSlot: () =>
          this.renderFeedbackAndCopyButtonsWrapper(),
        renderCitationsSlot: () => html`${this.renderCitationsList()}`,
        onToggle: (checked: boolean) => {
          checked ? this.generatedAnswer?.show() : this.generatedAnswer?.hide();
        },
        onRetry: () => this.generatedAnswer?.retry(),
        onClickShowButton: () => this.clickOnShowButton(),
        scrollable: this.scrollable,
        hidePreviousAnswers: this.hidePreviousAnswers,
        previousAnswersCollapsed: this.previousAnswersCollapsed,
        onTogglePreviousAnswers: this.handleTogglePreviousAnswers,
        onHidePreviousAnswers: this.handleHidePreviousAnswers,
      },
    });
  }

  private renderFollowUpInput() {
    if (!this.agentId) {
      return nothing;
    }

    const stickyClasses = this.stickyInput
      ? 'sticky bottom-0 bg-white z-10'
      : '';

    return html`
      <div class="px-6 ${stickyClasses}">
        ${renderFollowUpInput({
          props: {
            i18n: this.bindings.i18n,
            inputValue: this.followUpInputValue,
            onInput: this.handleFollowUpInputChange,
            canAskFollowUp: () => this.canAskFollowUp(),
            askFollowUp: this.handleAskFollowUp,
            onClearInput: this.handleClearFollowUpInput,
            buttonDisabled:
              !!this.generatedAnswerState.isStreaming ||
              this.isAnyFollowUpAnswerStreaming() ||
              this.followUpPending,
          },
        })}
      </div>
    `;
  }

  private renderDisclaimer() {
    if (this.hasRetryableError) {
      return nothing;
    }

    return html`
      <div class="flex justify-end px-6 pb-6">
        ${renderDisclaimer({
          props: {
            i18n: this.bindings.i18n,
            isStreaming: !!this.generatedAnswerState.isStreaming,
          },
        })}
      </div>
    `;
  }

  private renderCustomNoAnswerMessageWrapper() {
    return renderCustomNoAnswerMessage({
      props: {
        i18n: this.bindings.i18n,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-generated-answer': AtomicGeneratedAnswer;
  }
}
