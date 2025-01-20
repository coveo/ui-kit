import didNotAnswerQuestion from '@salesforce/label/c.quantic_DidNotAnswerQuestion';
import explainWhy from '@salesforce/label/c.quantic_ExplainWhy';
import Other from '@salesforce/label/c.quantic_Other';
import partiallyAnsweredQuestion from '@salesforce/label/c.quantic_PartiallyAnsweredQuestion';
import requestWasNotQuestion from '@salesforce/label/c.quantic_RequestWasNotQuestion';
import showLess from '@salesforce/label/c.quantic_SmartSnippetShowLess';
import showMore from '@salesforce/label/c.quantic_SmartSnippetShowMore';
import thankYouForFeedback from '@salesforce/label/c.quantic_ThankYouForFeedback';
import FeedbackModal from 'c/quanticFeedbackModal';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {getAbsoluteHeight} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SmartSnippet} SmartSnippet */
/** @typedef {import("coveo").SmartSnippetState} SmartSnippetState */
/** @typedef {import("coveo").SmartSnippetFeedback} SmartSnippetFeedback */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").Result} Result */

const FEEDBACK_LIKED_STATE = 'liked';
const FEEDBACK_DISLIKED_STATE = 'disliked';
const FEEDBACK_NEUTRAL_STATE = 'neutral';

const expandableAnswerBaseClass = 'smart-snippet__answer slds-is-relative';

/**
 * The `QuanticSmartSnippet` component displays the excerpt of a document that would be most likely to answer a particular query.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet engine-id={engineId} maximum-snippet-height="250"></c-quantic-smart-snippet>
 */
export default class QuanticSmartSnippet extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The maximum height an answer can have in pixels. Any part of an answer exceeding this height will be hidden by default and expendable via a "show more" button.
   * @api
   * @type {number}
   */
  @api maximumSnippetHeight = 250;

  /** @type {SmartSnippet} */
  smartSnippet;
  /** @type {SmartSnippetState} */
  state;
  /** @type {boolean} */
  snippetHeightExceedsMaxHeight;
  /** @type {boolean} */
  expandableAnswerDisplayUpdated = false;
  /** @type {string} */
  expandableAnswerClass = expandableAnswerBaseClass;
  /** @type {string} */
  answer;
  /** @type {boolean} */
  hideExplainWhyFeedbackButton = false;
  /** @type {boolean} */
  feedbackSubmitted = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSearchStatus;

  labels = {
    showMore,
    showLess,
    didNotAnswerQuestion,
    requestWasNotQuestion,
    partiallyAnsweredQuestion,
    Other,
    thankYouForFeedback,
    explainWhy,
  };

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
    if (this.answerFound && !this.expandableAnswerDisplayUpdated) {
      this.updateExpandableAnswerDisplay();
    }
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
    this.smartSnippet = this.headless.buildSmartSnippet(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribe = this.smartSnippet.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  initializeExpandableAnswerClass() {
    this.expandableAnswerClass = expandableAnswerBaseClass;
  }

  updateState() {
    this.state = this.smartSnippet.state;
    if (this.answer !== this.state.answer) {
      this.answer = this.state.answer;
      this.initializeExpandableAnswerClass();
      this.expandableAnswerDisplayUpdated = false;
    }
  }

  updateSearchStatusState() {
    if (!this.state.disliked && !this.state.liked) {
      this.feedbackSubmitted = false;
    }
  }

  /**
   * Updates the display of the expandable smart snippet answer.
   * @returns {void}
   */
  updateExpandableAnswerDisplay() {
    this.expandableAnswerDisplayUpdated = true;
    this.snippetHeightExceedsMaxHeight =
      this.smartSnippetAnswerElementHeight > this.maximumSnippetHeight;

    if (this.snippetHeightExceedsMaxHeight) {
      this.updateSmartSnippetCSSVariables();
      this.collapseSmartSnippetAnswer();
    }
  }

  /**
   * Sets the the value of the CSS variable "--maxHeight" the value of the maximumSnippetHeight property.
   * Sets the the value of the CSS variable "--fullHeight" the value of the actual height of the smart snippet answer.
   */
  updateSmartSnippetCSSVariables() {
    const styles = this.smartSnippetAnswerElement?.style;
    styles?.setProperty('--maxHeight', `${this.maximumSnippetHeight}px`);
    styles?.setProperty(
      '--fullHeight',
      `${this.smartSnippetAnswerElementHeight}px`
    );
  }

  /**
   * Applies the proper CSS class to expand the smart snippet answer.
   * @returns {void}
   */
  expandSmartSnippetAnswer() {
    this.expandableAnswerClass = `${expandableAnswerBaseClass} smart-snippet__answer--expanded`;
  }

  /**
   * Applies the proper CSS class to expand the smart snippet answer.
   * @returns {void}
   */
  collapseSmartSnippetAnswer() {
    this.expandableAnswerClass = `${expandableAnswerBaseClass} smart-snippet__answer--collapsed`;
  }

  /**
   * Handles the "show more" button press.
   * @returns {void}
   */
  showMore() {
    this.expandSmartSnippetAnswer();
    this.smartSnippet.expand();
  }

  /**
   * Handles the "show less" button press.
   * @returns {void}
   */
  showLess() {
    this.collapseSmartSnippetAnswer();
    this.smartSnippet.collapse();
  }

  handleToggleSmartSnippetAnswer() {
    if (this?.state?.expanded) {
      this.showLess();
    } else {
      this.showMore();
    }
  }

  /**
   * Handles the "like" button press.
   * @returns {void}
   */
  like = (event) => {
    event.stopPropagation();
    if (!this.liked) {
      this.smartSnippet.like();
      this.hideExplainWhyFeedbackButton = true;
    }
  };

  /**
   * Handles the "dislike" button press.
   * @returns {void}
   */
  dislike = (event) => {
    event.stopPropagation();
    if (!this.disliked) {
      this.smartSnippet.dislike();
      if (!this.feedbackSubmitted) {
        this.hideExplainWhyFeedbackButton = false;
      }
    }
  };

  /**
   * Handles the "explain why" button press.
   * @returns {void}
   */
  explainWhy = (event) => {
    event.stopPropagation();
    this.openFeedbackModal();
  };

  /**
   * Opens the feedback modal.
   */
  async openFeedbackModal() {
    this.smartSnippet.openFeedbackModal();
    // @ts-ignore
    await FeedbackModal.open({
      label: this.labels.explainWhy,
      size: 'small',
      description: this.labels.explainWhy,
      options: this.options,
      handleSubmit: this.submitFeedback.bind(this),
    });
    this.smartSnippet.closeFeedbackModal();
  }

  /**
   * Submits the feedback
   * @param {{value: SmartSnippetFeedback, details: string}} feedback
   * @returns {void}
   */
  submitFeedback(feedback) {
    if (feedback?.details) {
      this.smartSnippet.sendDetailedFeedback(feedback.details);
    } else if (feedback?.value) {
      this.smartSnippet.sendFeedback(feedback.value);
    }
    this.feedbackSubmitted = true;
    this.hideExplainWhyFeedbackButton = true;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  /**
   * Resturns the options displayed in the Quantic Feedback Modal.
   */
  get options() {
    return [
      {
        label: this.labels.didNotAnswerQuestion,
        value: 'does_not_answer',
      },
      {
        label: this.labels.partiallyAnsweredQuestion,
        value: 'partially_answers',
      },
      {
        label: this.labels.requestWasNotQuestion,
        value: 'was_not_a_question',
      },
      {
        label: this.labels.Other,
        value: 'other',
        withDetails: true,
        detailsRequired: true,
      },
    ];
  }

  /**
   * Returns the smart snippet question.
   * @returns {string}
   */
  get question() {
    return this?.state?.question;
  }

  /**
   * Indicates whether a smart snippet answer has been found.
   * @returns {boolean}
   */
  get answerFound() {
    return this?.state?.answerFound;
  }

  /**
   * Returns the smart snippet answer element.
   * @returns {HTMLElement}
   */
  get smartSnippetAnswerElement() {
    return this.template.querySelector('.smart-snippet__answer');
  }

  /**
   * Returns the smart snippet answer height.
   * @returns {number}
   */
  get smartSnippetAnswerElementHeight() {
    return getAbsoluteHeight(this.smartSnippetAnswerElement);
  }

  /**
   * Returns the smart snippet source.
   * @returns {Result}
   */
  get source() {
    return this?.state?.source;
  }

  /**
   * Returns the smart snippet source actions.
   */
  get smartSnippetSourceActions() {
    return {
      select: this?.smartSnippet?.selectSource,
      beginDelayedSelect: this?.smartSnippet?.beginDelayedSelectSource,
      cancelPendingSelect: this?.smartSnippet?.cancelPendingSelectSource,
    };
  }

  /**
   * Returns the smart snippet answer inline link actions.
   */
  get smartSnippetAnswerActions() {
    return {
      select: this.smartSnippet.selectInlineLink,
      beginDelayedSelect: this.smartSnippet.beginDelayedSelectInlineLink,
      cancelPendingSelect: this.smartSnippet.cancelPendingSelectInlineLink,
    };
  }

  /**
   * Returns the label to display in the smart snippet toggle.
   * @returns {string}
   */
  get toggleSmartSnippetAnswerLabel() {
    return this?.state?.expanded ? this.labels.showLess : this.labels.showMore;
  }

  /**
   * Returns the name of the icon to display in the smart snippet toggle.
   * @returns {string}
   */
  get toggleSmartSnippetAnswerIcon() {
    return this?.state?.expanded ? 'utility:chevronup' : 'utility:chevrondown';
  }

  /**
   * Indicates whether the smart snippet has a positive feedback.
   * @returns {boolean}
   */
  get liked() {
    return this?.state?.liked;
  }

  /**
   * Indicates whether the smart snippet has a negative feedback.
   * @returns {boolean}
   */
  get disliked() {
    return this?.state?.disliked;
  }

  /**
   * Returns the state of the feedback component.
   * @returns {'liked' | 'disliked' | 'neutral'}
   */
  get feedbackState() {
    return this.liked
      ? FEEDBACK_LIKED_STATE
      : this.disliked
        ? FEEDBACK_DISLIKED_STATE
        : FEEDBACK_NEUTRAL_STATE;
  }
}
