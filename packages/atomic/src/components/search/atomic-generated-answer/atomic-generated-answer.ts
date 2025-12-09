import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchStatus,
  buildTabManager,
  type GeneratedAnswer,
  type GeneratedAnswerCitation,
  type GeneratedAnswerState,
  type SearchStatus,
  type SearchStatusState,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {html, LitElement, nothing, type PropertyValueMap} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {renderCopyButton} from '@/src/components/common/generated-answer/copy-button';
import {renderFeedbackButton} from '@/src/components/common/generated-answer/feedback-button';
import {renderGeneratedContentContainer} from '@/src/components/common/generated-answer/generated-content-container';
import {renderRetryPrompt} from '@/src/components/common/generated-answer/retry-prompt';
import {renderShowButton} from '@/src/components/common/generated-answer/show-button';
import {renderSourceCitations} from '@/src/components/common/generated-answer/source-citations';
import {renderHeading} from '@/src/components/common/heading';
import {renderSwitch} from '@/src/components/common/switch';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {debounce} from '@/src/utils/debounce-utils';
import {
  type GeneratedAnswerData,
  SafeStorage,
  StorageItems,
} from '@/src/utils/local-storage-utils';
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

  private readonly DEFAULT_COLLAPSED_HEIGHT = 16;
  private readonly MAX_COLLAPSED_HEIGHT = 32;
  private readonly MIN_COLLAPSED_HEIGHT = 9;
  private readonly REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS = ['filetype'];

  private resizeObserver?: ResizeObserver;
  private fullAnswerHeight?: number;
  private storage: SafeStorage = new SafeStorage();
  private storedData!: GeneratedAnswerData;
  private modalRef?: HTMLAtomicGeneratedAnswerFeedbackModalElement;

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
   * A list of fields to include with the citations used to generate the answer.
   */
  @property({type: String, attribute: 'fields-to-include-in-citations'})
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
  public generatedAnswer!: GeneratedAnswer;

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

    this.storedData = this.readStoredData();

    this.generatedAnswer = buildGeneratedAnswer(this.bindings.engine, {
      initialState: {
        isVisible: this.storedData.isVisible,
        responseFormat: {
          contentFormat: ['text/markdown', 'text/plain'],
        },
      },
      ...(this.answerConfigurationId && {
        answerConfigurationId: this.answerConfigurationId,
      }),
      fieldsToIncludeInCitations: this.getCitationFields(),
    });
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.tabManager = buildTabManager(this.bindings.engine);

    this.insertFeedbackModal();

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
      return html`${nothing}`;
    }

    const contentClasses =
      'mx-auto mt-0 mb-4 border border-neutral shadow-lg p-6 bg-background rounded-lg p-6 text-on-background';

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
              <article>${this.renderCustomNoAnswerMessage()}</article>
            </aside>
          </div>
        `;
      }
      return html`${nothing}`;
    }

    return html`
      <div>
        <aside
          class=${contentClasses}
          part="container"
          aria-label=${this.bindings.i18n.t('generated-answer-title')}
        >
          <article>${this.renderContent()}</article>
        </aside>
      </div>
    `;
  }

  // Used by bindStateToController decorator via onUpdateCallbackMethod option
  public onGeneratedAnswerStateUpdate = () => {
    if (this.generatedAnswerState.isVisible !== this.storedData?.isVisible) {
      this.storedData = {
        ...this.storedData,
        isVisible: this.generatedAnswerState.isVisible,
      };
      this.writeStoredData(this.storedData);
    }

    this.ariaMessage.message = this.getGeneratedAnswerStatus();
  };

  private getGeneratedAnswerStatus() {
    const isHidden = !this.generatedAnswerState?.isVisible;
    const isGenerating = !!this.generatedAnswerState?.isStreaming;
    const hasAnswer = !!this.generatedAnswerState?.answer;
    const hasError = !!this.generatedAnswerState?.error;

    if (isHidden) {
      return this.bindings.i18n.t('generated-answer-hidden');
    }

    if (isGenerating) {
      return this.bindings.i18n.t('generating-answer');
    }

    if (hasError) {
      return this.bindings.i18n.t('answer-could-not-be-generated');
    }

    if (hasAnswer) {
      return this.bindings.i18n.t('answer-generated', {
        answer: this.generatedAnswerState?.answer,
      });
    }

    return '';
  }

  private get hasRetryableError() {
    return (
      !this.searchStatusState?.hasError &&
      this.generatedAnswerState?.error?.isRetryable
    );
  }

  private get hasNoAnswerGenerated() {
    const {answer, citations} = this.generatedAnswerState ?? {};
    return (
      answer === undefined && !citations?.length && !this.hasRetryableError
    );
  }

  private get isAnswerVisible() {
    return this.generatedAnswerState?.isVisible;
  }

  private get toggleTooltip() {
    const key = this.isAnswerVisible
      ? 'generated-answer-toggle-on'
      : 'generated-answer-toggle-off';
    return this.bindings.i18n.t(key);
  }

  private get hasClipboard() {
    return !!navigator?.clipboard?.writeText;
  }

  private get copyToClipboardTooltip() {
    if (this.copyError) {
      return this.bindings.i18n.t('failed-to-copy-generated-answer');
    }

    return !this.copied
      ? this.bindings.i18n.t('copy-generated-answer')
      : this.bindings.i18n.t('generated-answer-copied');
  }

  private get hasCustomNoAnswerMessage() {
    return getNamedSlotContent(this, 'no-answer-message').length > 0;
  }

  private insertFeedbackModal() {
    this.modalRef = document.createElement(
      'atomic-generated-answer-feedback-modal'
    );
    this.modalRef.generatedAnswer = this.generatedAnswer;
    this.insertAdjacentElement('beforebegin', this.modalRef);
  }

  private readStoredData(): GeneratedAnswerData {
    const storedData = this.storage.getParsedJSON<GeneratedAnswerData>(
      StorageItems.GENERATED_ANSWER_DATA,
      {isVisible: true}
    );

    // This check ensures that the answer is visible when the toggle is hidden and visible is set to false in the local storage.
    return {
      isVisible: (this.withToggle && storedData.isVisible) || !this.withToggle,
    };
  }

  private writeStoredData(data: GeneratedAnswerData) {
    this.storage.setJSON(StorageItems.GENERATED_ANSWER_DATA, data);
  }

  private async copyToClipboard(answer: string) {
    try {
      await navigator.clipboard.writeText(answer);
      this.copied = true;
      this.generatedAnswer?.logCopyToClipboard();
    } catch (error) {
      this.copyError = true;
      this.bindings.engine.logger.error(
        `Failed to copy to clipboard: ${error}`
      );
    }

    setTimeout(() => {
      this.copied = false;
      this.copyError = false;
    }, 2000);
  }

  private clickOnShowButton() {
    if (this.generatedAnswerState?.expanded) {
      this.generatedAnswer?.collapse();
    } else {
      this.generatedAnswer?.expand();
    }
  }

  private getCitation(citation: GeneratedAnswerCitation) {
    const {title} = citation;
    const {i18n} = this.bindings;

    return title.trim() !== ''
      ? citation
      : {...citation, title: i18n.t('no-title')};
  }

  private getCitationFields() {
    return (this.fieldsToIncludeInCitations ?? '')
      .split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0)
      .concat(this.REQUIRED_FIELDS_TO_INCLUDE_IN_CITATIONS);
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

  private setIsAnswerHelpful(isAnswerHelpful: boolean) {
    if (this.modalRef) {
      this.modalRef.helpful = isAnswerHelpful;
    }
  }

  private openFeedbackModal() {
    if (this.modalRef && !this.generatedAnswerState?.feedbackSubmitted) {
      this.modalRef.isOpen = true;
    }
  }

  private clickDislike() {
    this.setIsAnswerHelpful(false);
    this.generatedAnswer?.dislike();
    this.openFeedbackModal();
  }

  private clickLike() {
    this.setIsAnswerHelpful(true);
    this.generatedAnswer?.like();
    this.openFeedbackModal();
  }

  private renderCitations() {
    const {citations} = this.generatedAnswerState ?? {};

    return citations?.map(
      (citation: GeneratedAnswerCitation, index: number) => {
        const interactiveCitation = buildInteractiveCitation(
          this.bindings.engine,
          {
            options: {
              citation,
            },
          }
        );
        return keyed(
          citation.id,
          html`
            <li class="max-w-full">
              <atomic-citation
                .citation=${this.getCitation(citation)}
                .index=${index}
                .sendHoverEndEvent=${(citationHoverTimeMs: number) => {
                  this.generatedAnswer?.logCitationHover(
                    citation.id,
                    citationHoverTimeMs
                  );
                }}
                .interactiveCitation=${interactiveCitation}
                .disableCitationAnchoring=${this.disableCitationAnchoring}
                exportparts="citation,citation-popover"
              ></atomic-citation>
            </li>
          `
        );
      }
    );
  }

  private renderFeedbackAndCopyButtons() {
    const {i18n} = this.bindings;
    const {liked, disliked, answer, isStreaming} =
      this.generatedAnswerState ?? {};

    const containerClasses = [
      'feedback-buttons',
      'flex',
      'h-9',
      'absolute',
      'top-6',
      'shrink-0',
      'gap-2',
      this.withToggle ? 'right-20' : 'right-6',
    ].join(' ');

    if (isStreaming) {
      return nothing;
    }

    return html`
      <div class=${containerClasses}>
        ${renderFeedbackButton({
          props: {
            title: i18n.t('this-answer-was-helpful'),
            variant: 'like',
            active: !!liked,
            onClick: () => this.clickLike(),
          },
        })}
        ${renderFeedbackButton({
          props: {
            title: i18n.t('this-answer-was-not-helpful'),
            variant: 'dislike',
            active: !!disliked,
            onClick: () => this.clickDislike(),
          },
        })}
        ${
          this.hasClipboard
            ? renderCopyButton({
                props: {
                  title: this.copyToClipboardTooltip,
                  isCopied: this.copied,
                  error: this.copyError,
                  onClick: async () => {
                    if (answer) {
                      await this.copyToClipboard(answer);
                    }
                  },
                },
              })
            : nothing
        }
      </div>
    `;
  }

  private renderDisclaimer() {
    const {i18n} = this.bindings;
    const {isStreaming} = this.generatedAnswerState ?? {};

    if (isStreaming) {
      return nothing;
    }
    return html`
      <div class="text-neutral-dark text-xs/[1rem]">
        <slot name="disclaimer">${i18n.t('generated-answer-disclaimer')}</slot>
      </div>
    `;
  }

  private renderShowButton() {
    const {i18n} = this.bindings;
    const {expanded, isStreaming} = this.generatedAnswerState ?? {};
    const canRender = this.collapsible && !isStreaming;

    if (!canRender) {
      return nothing;
    }
    return renderShowButton({
      props: {
        i18n,
        onClick: () => this.clickOnShowButton(),
        isCollapsed: !expanded,
      },
    });
  }

  private renderGeneratingAnswerLabel() {
    const {i18n} = this.bindings;
    const {isStreaming} = this.generatedAnswerState ?? {};

    const canRender = this.collapsible && isStreaming;

    if (!canRender) {
      return nothing;
    }
    return html`
      <div
        part="is-generating"
        class="text-primary hidden text-base font-light"
      >
        ${i18n.t('generating-answer')}...
      </div>
    `;
  }

  private renderContent() {
    const {i18n} = this.bindings;
    const {isStreaming, answer, citations, answerContentFormat} =
      this.generatedAnswerState ?? {};

    return html`
      <div part="generated-content">
        <div class="flex items-center">
          ${renderHeading({
            props: {
              level: 0,
              part: 'header-label',
              class:
                'text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium',
            },
          })(html`${i18n.t('generated-answer-title')}`)}
          <div class="ml-auto flex h-9 items-center">
            ${renderSwitch({
              props: {
                part: 'toggle',
                checked: !!this.isAnswerVisible,
                onToggle: (checked: boolean) => {
                  checked
                    ? this.generatedAnswer?.show()
                    : this.generatedAnswer?.hide();
                },
                ariaLabel: i18n.t('generated-answer-title'),
                title: this.toggleTooltip,
                withToggle: this.withToggle,
                tabIndex: 0,
              },
            })}
          </div>
        </div>
        ${
          this.hasRetryableError && this.isAnswerVisible
            ? renderRetryPrompt({
                props: {
                  onClick: () => this.generatedAnswer?.retry(),
                  buttonLabel: i18n.t('retry'),
                  message: i18n.t('retry-stream-message'),
                },
              })
            : nothing
        }
        ${
          !this.hasRetryableError && this.isAnswerVisible
            ? renderGeneratedContentContainer({
                props: {
                  answer,
                  answerContentFormat,
                  isStreaming: !!isStreaming,
                },
              })(html`
              ${this.renderFeedbackAndCopyButtons()}
              ${renderSourceCitations({
                props: {
                  label: i18n.t('citations'),
                  isVisible: !!citations?.length,
                },
              })(html`${this.renderCitations()}`)}
            `)
            : nothing
        }
        ${
          !this.hasRetryableError && this.isAnswerVisible
            ? html`
              <div part="generated-answer-footer" class="mt-6 flex justify-end">
                ${this.renderGeneratingAnswerLabel()} ${this.renderShowButton()}
                ${this.renderDisclaimer()}
              </div>
            `
            : nothing
        }
      </div>
    `;
  }

  private renderCustomNoAnswerMessage() {
    const {i18n} = this.bindings;

    return html`
      <div part="generated-content">
        <div class="flex items-center">
          ${renderHeading({
            props: {
              level: 0,
              part: 'header-label',
              class:
                'text-primary bg-primary-background inline-block rounded-md px-2.5 py-2 font-medium',
            },
          })(html`${i18n.t('generated-answer-title')}`)}
        </div>
        <div part="generated-container" class="mt-6 break-words">
          <slot name="no-answer-message"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-generated-answer': AtomicGeneratedAnswer;
  }
}
