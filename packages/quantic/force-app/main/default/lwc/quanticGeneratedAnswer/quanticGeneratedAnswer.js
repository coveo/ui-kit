import answerGenerated from '@salesforce/label/c.quantic_AnswerGenerated';
import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import feedbackHelpUsImprove from '@salesforce/label/c.quantic_FeedbackHelpUsImprove';
import generatedAnswerForYou from '@salesforce/label/c.quantic_GeneratedAnswerForYou';
import generatedAnswerIsHidden from '@salesforce/label/c.quantic_GeneratedAnswerIsHidden';
import showLess from '@salesforce/label/c.quantic_GeneratedAnswerShowLess';
import showMore from '@salesforce/label/c.quantic_GeneratedAnswerShowMore';
import generatingAnswer from '@salesforce/label/c.quantic_GeneratingAnswer';
import loading from '@salesforce/label/c.quantic_Loading';
import rgaDisclaimer from '@salesforce/label/c.quantic_RGADisclaimer';
import tryAgain from '@salesforce/label/c.quantic_TryAgain';
import noGeneratedAnswer from '@salesforce/label/c.quantic_NoGeneratedAnswer';
import FeedbackModalQna from 'c/quanticFeedbackModalQna';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
// @ts-ignore
import generatedAnswerTemplate from './templates/generatedAnswer.html';
// @ts-ignore
import loadingTemplate from './templates/loading.html';
// @ts-ignore
import retryPromptTemplate from './templates/retryPrompt.html';
// @ts-ignore
import conversationTemplate from './templates/conversation.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").GeneratedAnswer} GeneratedAnswer */
/** @typedef {import("coveo").GeneratedAnswerWithFollowUps} GeneratedAnswerWithFollowUps */
/** @typedef {import("coveo").GeneratedAnswerState} GeneratedAnswerState */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchStatusState} SearchStatusState */

const DEFAULT_COLLAPSED_HEIGHT = 250;
const MAX_VALID_COLLAPSED_HEIGHT = 500;
const MIN_VALID_COLLAPSED_HEIGHT = 150;

const GENERATED_ANSWER_DATA_KEY = 'coveo-generated-answer-data';
const DEFAULT_CITATION_FIELDS = ['sfid', 'sfkbid', 'sfkavid', 'filetype'];

/**
 * The `QuanticGeneratedAnswer` component automatically generates an answer using Coveo Machine Learning models to answer the query executed by the user.
 * This component includes a slot, "no-answer-message", which allows for rendering a custom message when no answer is generated.
 * @category Search
 * @slot no-answer-message - Slot that allows the rendering of a custom message when no answer is generated.
 * @example
 * <c-quantic-generated-answer engine-id={engineId} with-toggle collapsible>
 *  <div slot="no-answer-message">No answer was generated.</div>
 * </c-quantic-generated-answer>
 */
export default class QuanticGeneratedAnswer extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * A list of fields to fetch with the citations used to generate the answer.
   * @api
   * @type {string}
   * @defaultValue `'sfid,sfkbid,sfkavid,filetype'`
   */
  @api fieldsToIncludeInCitations = 'sfid,sfkbid,sfkavid,filetype';
  /**
   * Whether the generated answer should be collapsible when it exceeds the maximum height of 250px.
   * @api
   * @type {boolean}
   * @default {false}
   */
  @api collapsible = false;
  /**
   * Whether the generated answer can be toggled on or off.
   * @api
   * @type {boolean}
   * @default {false}
   */
  @api withToggle = false;
  /**
   * The unique identifier of the answer configuration to use to generate the answer.
   * @api
   * @type {string}
   * @default {undefined}
   */
  @api answerConfigurationId;
  /**
   * The unique identifier of the agent to use to generate the answer.
   * @api
   * @type {string}
   * @default {undefined}
   */
  @api agentId;
  /**
   * The maximum height (in px units) of the generated answer when it is collapsed.
   * @api
   * @type {number}
   * @default {250}
   */
  @api
  get maxCollapsedHeight() {
    return this._maxCollapsedHeight;
  }
  set maxCollapsedHeight(value) {
    if (
      value >= MIN_VALID_COLLAPSED_HEIGHT &&
      value <= MAX_VALID_COLLAPSED_HEIGHT
    ) {
      this._maxCollapsedHeight = value;
    } else {
      console.warn(
        `Cannot set max-collapsed-height to (${value}) it accepts a range between ${MIN_VALID_COLLAPSED_HEIGHT} and ${MAX_VALID_COLLAPSED_HEIGHT}. The default value of ${DEFAULT_COLLAPSED_HEIGHT}px will be used.`
      );
      this._maxCollapsedHeight = DEFAULT_COLLAPSED_HEIGHT;
    }
  }
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   * @default false
   */
  @api disableCitationAnchoring = false;

  labels = {
    generatedAnswerForYou,
    tryAgain,
    couldNotGenerateAnAnswer,
    feedbackHelpUsImprove,
    generatingAnswer,
    generatedAnswerIsHidden,
    answerGenerated,
    rgaDisclaimer,
    showMore,
    showLess,
    loading,
    noGeneratedAnswer,
  };

  /** @type { GeneratedAnswer | GeneratedAnswerWithFollowUps} */
  generatedAnswer;
  /** @type {GeneratedAnswerState} */
  state;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {SearchStatusState} */
  searchStatusState;
  /** @type {boolean} */
  feedbackSubmitted = false;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  ariaLiveMessage;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {boolean} */
  _exceedsMaximumHeight = false;
  /** @type {number} */
  _maxCollapsedHeight = DEFAULT_COLLAPSED_HEIGHT;
  /** @type {number} */
  generatedAnswerHeight = 0;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener(
      'quantic__generatedanswercopy',
      this.handleGeneratedAnswerCopyToClipboard
    );
    if (this.withToggle) {
      this.template.addEventListener(
        'quantic__generatedanswertoggle',
        this.handleGeneratedAnswerToggle
      );
    }
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    if (this.isCollapsibleEnabled) {
      this._exceedsMaximumHeight = this.isMaximumHeightExceeded();
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.ariaLiveMessage = AriaLiveRegion('GeneratedAnswer', this);
    this.headless = getHeadlessBundle(this.engineId);
    this.generatedAnswer = this.buildHeadlessGeneratedAnswerController(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribeGeneratedAnswer = this.generatedAnswer.subscribe(() =>
      this.updateState()
    );
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  };

  buildHeadlessGeneratedAnswerController(engine) {
    let initialVisibility = true;
    if (this.withToggle) {
      const storedGeneratedAnswerData = this.readStoredData();
      if (storedGeneratedAnswerData?.isVisible === false) {
        initialVisibility = false;
      }
    }
    return this.headless.buildGeneratedAnswer(engine, {
      initialState: {
        isVisible: initialVisibility,
        responseFormat: {
          contentFormat: ['text/markdown', 'text/plain'],
        },
      },
      ...(this.answerConfigurationId && {
        answerConfigurationId: this.answerConfigurationId,
      }),
      ...(this.agentId?.trim() && {
        agentId: this.agentId.trim(),
      }),
      fieldsToIncludeInCitations: this.citationFields,
    });
  }

  disconnectedCallback() {
    this.unsubscribeGeneratedAnswer?.();
    this.template.removeEventListener(
      'quantic__generatedanswercopy',
      this.handleGeneratedAnswerCopyToClipboard
    );
    if (this.withToggle) {
      this.template.removeEventListener(
        'quantic__generatedanswertoggle',
        this.handleGeneratedAnswerToggle
      );
    }
  }

  updateState() {
    this.state = this.generatedAnswer.state;
    this.ariaLiveMessage.dispatchMessage(this.getGeneratedAnswerStatus());

    if (this.isCollapsibleEnabled) {
      this.updateGeneratedAnswerCSSVariables();
    }
  }

  isMaximumHeightExceeded() {
    // If we are still streaming add a little extra height to the answer element to account for the next answer chunk.
    // This helps a lot with the jankyness of the answer fading out when the chunk is close but not yet over the max height.
    const answerElementHeight = this.isStreaming
      ? this.generatedAnswerHeight + 50
      : this.generatedAnswerHeight;

    return answerElementHeight > this.maxCollapsedHeight;
  }

  getGeneratedAnswerStatus() {
    if (!this.state.isVisible) {
      return this.labels.generatedAnswerIsHidden;
    }

    if (this.hasRetryableError) {
      return this.labels.couldNotGenerateAnAnswer;
    }

    const isGenerating = this.state.isStreaming;
    if (isGenerating) {
      return this.labels.generatingAnswer;
    }

    const hasAnswer = !!this.state.answer;
    return hasAnswer
      ? I18nUtils.format(this.labels.answerGenerated, this.answer)
      : '';
  }

  updateSearchStatusState() {
    this.feedbackSubmitted = false;
    this.searchStatusState = this.searchStatus.state;
  }

  /**
   * handles liking the generated answer.
   * @param {CustomEvent} event
   */
  async handleLike(event) {
    event.stopPropagation();
    this.generatedAnswer.like?.(event.detail?.answerId);
    if (!this.feedbackSubmitted && !this.areFollowUpsEnabled) {
      // @ts-ignore
      await FeedbackModalQna.open({
        size: 'small',
        label: this.labels.feedbackHelpUsImprove,
        handleSubmit: (feedbackPayload) => {
          this.submitFeedback({...feedbackPayload, helpful: true});
        },
      });
      this.generatedAnswer.closeFeedbackModal();
    }
  }

  /**
   * handles hovering over a citation.
   * @param {CustomEvent} event
   */
  handleCitationHover(event) {
    event.stopPropagation();
    const {citationId, citationHoverTimeMs, answerId} = event.detail;
    this.generatedAnswer.logCitationHover(
      citationId,
      citationHoverTimeMs,
      answerId
    );
  }

  /**
   * handles disliking the generated answer.
   * @param {CustomEvent} event
   */
  async handleDislike(event) {
    event.stopPropagation();
    this.generatedAnswer.dislike?.(event.detail?.answerId);
    if (!this.feedbackSubmitted && !this.areFollowUpsEnabled) {
      // @ts-ignore
      await FeedbackModalQna.open({
        size: 'small',
        label: this.labels.feedbackHelpUsImprove,
        handleSubmit: (feedbackPayload) => {
          this.submitFeedback({...feedbackPayload, helpful: false});
        },
      });
      this.generatedAnswer.closeFeedbackModal();
    }
  }

  /**
   * Submits the feedback
   * @returns {void}
   */
  submitFeedback(feedbackPayload) {
    this.generatedAnswer.sendFeedback(feedbackPayload);
    this.feedbackSubmitted = true;
  }

  handleRetry() {
    this.generatedAnswer.retry();
  }

  /**
   * handles copying the generated answer to the clipboard.
   * @param {CustomEvent} event
   */
  handleGeneratedAnswerCopyToClipboard = (event) => {
    event.stopPropagation();
    this.generatedAnswer.logCopyToClipboard(event.detail?.answerId);
  };

  handleGeneratedAnswerToggle = (event) => {
    event.stopPropagation();
    if (!this.withToggle) {
      return;
    }
    if (this.isVisible) {
      this.generatedAnswer.hide();
      this.writeStoredDate({isVisible: false});
    } else {
      this.generatedAnswer.show();
      this.writeStoredDate({isVisible: true});
    }
  };

  handleAnswerContentUpdated = (event) => {
    event.stopPropagation();
    this.generatedAnswerHeight = event.detail?.height;
    if (this.isCollapsibleEnabled) {
      this._exceedsMaximumHeight = this.isMaximumHeightExceeded();
    }
    this.updateGeneratedAnswerCSSVariables();
  };

  handleToggleCollapseAnswer() {
    this.state?.expanded
      ? this.generatedAnswer.collapse()
      : this.generatedAnswer.expand();
    this.updateGeneratedAnswerCSSVariables();
  }

  readStoredData() {
    try {
      return JSON.parse(sessionStorage?.getItem(GENERATED_ANSWER_DATA_KEY));
    } catch {
      return {};
    }
  }

  writeStoredDate(data) {
    sessionStorage?.setItem(GENERATED_ANSWER_DATA_KEY, JSON.stringify(data));
  }

  /**
   * Returns the generated answer element.
   * @returns {HTMLElement}
   */
  get generatedAnswerElement() {
    return this.template.querySelector('.generated-answer__answer');
  }

  /**
   * Sets the value of the CSS variable "--maxHeight" to the value of the maxCollapsedHeight property.
   */
  updateGeneratedAnswerCSSVariables() {
    if (this._exceedsMaximumHeight) {
      const styles = this.generatedAnswerElement?.style;
      styles?.setProperty('--maxHeight', `${this.maxCollapsedHeight}px`);
    }
  }

  get answer() {
    return this?.state?.answer;
  }

  get citations() {
    return this?.state?.citations;
  }

  get isStreaming() {
    return this?.state?.isStreaming;
  }

  get isVisible() {
    return this.state.isVisible;
  }

  /**
   * Returns the generated answer controller narrowed to `GeneratedAnswerWithFollowUps`, or `null` if follow-ups are not available.
   * @returns {GeneratedAnswerWithFollowUps | null}
   */
  get generateAnswerWithFollowUps() {
    if (
      !this.agentId ||
      !this.generatedAnswer ||
      !('askFollowUp' in this.generatedAnswer)
    ) {
      return null;
    }
    return /** @type {GeneratedAnswerWithFollowUps} */ (this.generatedAnswer);
  }

  get areFollowUpsEnabled() {
    return (
      this.generateAnswerWithFollowUps?.state.followUpAnswers?.isEnabled ===
      true
    );
  }

  get initialAnswer() {
    return {
      ...this.state,
      question: this.engine?.state.query?.q ?? '',
    };
  }

  get allGeneratedAnswers() {
    const followUpAnswers =
      this.generateAnswerWithFollowUps?.state.followUpAnswers
        ?.followUpAnswers ?? [];
    return [this.initialAnswer, ...followUpAnswers];
  }

  get isCollapsibleEnabled() {
    return this.collapsible && !this.areFollowUpsEnabled;
  }

  get isAnswerCollapsed() {
    // Answer is considered collapsed only if it exceeds the maximum height and was not expanded.
    return this._exceedsMaximumHeight && !this.isExpanded;
  }

  get shouldDisplayGeneratedAnswer() {
    const hasCitations = !!this.citations?.length;
    return !!this.answer || hasCitations || this.hasRetryableError;
  }

  get generatedAnswerClass() {
    let collapsedStateClass = '';
    if (this._exceedsMaximumHeight) {
      collapsedStateClass = this.isExpanded
        ? 'generated-answer__answer--expanded'
        : 'generated-answer__answer--collapsed';
    }
    return `generated-answer__answer ${collapsedStateClass}`;
  }

  get hasRetryableError() {
    return !this?.searchStatusState?.hasError && this.state?.error?.isRetryable;
  }

  get generatedAnswerHeaderClass() {
    const headerBaseClass =
      'generated-answer__card-header slds-grid slds-grid_vertical-align-center slds-grid_align-spread slds-p-horizontal_large slds-p-vertical_small';
    return this.isVisible
      ? `${headerBaseClass} slds-border_bottom`
      : headerBaseClass;
  }

  get citationFields() {
    const userCitationFields =
      this.fieldsToIncludeInCitations
        ?.split(',')
        .map((field) => field.trim())
        .filter((field) => field.length > 0) || [];

    const combinedCitationFields = [
      ...DEFAULT_CITATION_FIELDS,
      ...userCitationFields,
    ];
    return [...new Set(combinedCitationFields)];
  }

  get shouldShowDisclaimer() {
    return this.isVisible && !this.isStreaming;
  }

  get toggleCollapseAnswerIcon() {
    return this.isAnswerCollapsed ? 'utility:chevrondown' : 'utility:chevronup';
  }

  /**
   * Returns the label to display in the generated answer show more|show less button.
   * @returns {string}
   */
  get toggleCollapseAnswerLabel() {
    return this.isAnswerCollapsed ? this.labels.showMore : this.labels.showLess;
  }

  get isExpanded() {
    return this.state?.expanded;
  }

  /**
   * Returns whether the component has a custom message to display when no answer is generated.
   * @returns {boolean}
   */
  get hasCustomNoAnswerMessage() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="no-answer-message"]');
    return !!slot?.assignedNodes()?.length;
  }

  get cannotAnswer() {
    return this.state?.cannotAnswer && this.searchStatusState?.hasResults;
  }

  get isLoading() {
    return this.state?.isLoading;
  }

  get isAnswerGenerationOngoing() {
    const initialAnswerPending = this.isStreaming || this.isLoading;
    const followUpAnswers =
      this.generateAnswerWithFollowUps?.state?.followUpAnswers
        ?.followUpAnswers ?? [];
    return (
      initialAnswerPending ||
      followUpAnswers.some((answer) => answer.isStreaming || answer.isLoading)
    );
  }

  get isManualAnswerGeneration() {
    return this.state?.answerGenerationMode === 'manual';
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  /**
   * Handles the submission of a follow-up question from the `QuanticGeneratedAnswerFollowUpInput` component.
   * @param {CustomEvent} event - The custom event containing the follow-up question details.
   * @returns {void}
   */
  handleFollowUpSubmit = (event) => {
    this.generateAnswerWithFollowUps?.askFollowUp(event.detail.value);
  };

  render() {
    if (this.hasInitializationError) {
      return errorTemplate;
    }
    if (
      this.isLoading &&
      this.isManualAnswerGeneration &&
      !this.state?.cannotAnswer
    ) {
      return loadingTemplate;
    }
    if (this.hasRetryableError) {
      return retryPromptTemplate;
    }
    if (this.areFollowUpsEnabled) {
      return conversationTemplate;
    }
    return generatedAnswerTemplate;
  }
}
