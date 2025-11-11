import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */

export default class QuanticConversation extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The unique identifier of the answer configuration to use to generate the answer.
   * @api
   * @type {string}
   * @default {undefined}
   */
  @api answerConfigurationId;

  /** @type {Function} */
  unsubscribe;
  headless;
  /** @type {boolean} */
  hasInitializationError = false;
  answers = [];
  activeSectionName = null;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.conversation = this.headless.buildMultiturnConversation(engine, {
      answerConfigurationId: this.answerConfigurationId,
    });
    this.conversation.subscribeToSearchRequest();
    this.unsubscribe = this.conversation.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.answers = this.conversation?.state?.answers ?? [];
    if (this.answers.length > 0) {
      this.activeSectionName = [this.answers[this.answers.length - 1].prompt];
    }
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  handleFollowUpQuestion(event) {
    /** @type {HTMLInputElement} */
    const input = this.template.querySelector('lightning-input');
    this.conversation.ask(input.value);
    input.value = '';
  }
}
