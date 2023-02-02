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

const expandableAnswerBaseClass = 'smart-snippet__answer slds-is-relative';

/**
 * The `QuanticSmartSnippet` component displays the excerpt of a document that would be most likely to answer a particular query.
 * @category Search
 * @example
 *  <c-quantic-smart-snippet maximum-snippet-height="250"></c-quantic-smart-snippet>
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
  @api maximumSnippetHeight = 150;

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
    this.unsubscribe = this.smartSnippet.subscribe(() => this.updateState());
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

  /**
   * Updates the display of the expandable smart snippet answer.c/exampleSearch
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
    styles.setProperty('--maxHeight', `${this.maximumSnippetHeight}px`);
    styles.setProperty(
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
   * Returns the smart snippet source title.
   * @returns {string}
   */
  get sourceTitle() {
    return this?.state?.source?.title;
  }

  /**
   * Returns the smart snippet source uri.
   * @returns {string}
   */
  get sourceUri() {
    return this?.state?.source.clickUri;
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
    return this?.state?.expanded ? 'Show less' : 'Show more';
  }

  /**
   * Returns the name of the icon to display in the smart snippet toggle.
   * @returns {string}
   */
  get toggleSmartSnippetAnswerIcon() {
    return this?.state?.expanded ? 'utility:chevronup' : 'utility:chevrondown';
  }
}
