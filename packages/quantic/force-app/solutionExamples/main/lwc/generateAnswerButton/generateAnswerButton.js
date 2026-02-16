import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
import generateAnswer from '@salesforce/label/c.GenerateAnswer';

/** @typedef {import("coveo").InsightEngine} InsightEngine */

export default class GenerateAnswerButton extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  labels = {
    generateAnswer,
  };

  /** @type {object} */
  actions;
  /** @type {InsightEngine} */
  engine;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {boolean} */
  generateAnswerButtonIsDisplayed = true;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.engine = engine;
    this.headless = getHeadlessBundle(this.engineId);
    this.searchBox = this.headless.buildSearchBox(engine);
    this.unsubscribeSearchBox = this.searchBox.subscribe(() =>
      this.updateGenerateAnswerButtonVisibility()
    );
    this.actions = {
      ...this.headless.loadGeneratedAnswerActions(engine),
    };
  };

  disconnectedCallback() {
    this.unsubscribeSearchBox?.();
  }

  /**
   * Updates generate answer button visibility.
   * @returns {void}
   */
  updateGenerateAnswerButtonVisibility() {
    if (
      !this.generateAnswerButtonIsDisplayed &&
      this.searchBox.state.isLoading
    ) {
      return;
    }
    this.generateAnswerButtonIsDisplayed = !this.searchBox.state.value;
  }

  /**
   * Handles the button click event and triggers answer generation.
   */
  generateAnswer() {
    this.engine.dispatch(this.actions.setAnswerGenerationMode('manual'));
    this.engine.dispatch(this.actions.generateAnswer());
    this.generateAnswerButtonIsDisplayed = false;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
