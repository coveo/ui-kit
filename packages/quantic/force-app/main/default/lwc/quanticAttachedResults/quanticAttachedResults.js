import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticPager` provides buttons that allow the end user to navigate through the different result pages.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-pager engine-id={engineId} number-of-pages="4"></c-quantic-pager>
 */
export default class QuanticPager extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  attachedResults;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;


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
    this.attachedResults = this.headless.buildAttachedResults(engine, {
      options: {
        caseId: '123',
      },
    });
    this.attachedResults.fetchAttachedResults();
    this.unsubscribe = this.attachedResults.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    console.log('update state');
    console.log(this.attachedResults.state);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
