import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import insightRelatedToThisCase from '@salesforce/label/c.quantic_InsightRelatedToThisCase';

/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").SearchBox} SearchBox */
/** @typedef {import("coveo").QuerySummary} QuerySummary */

/**
 * The `QuanticInsightPanelSummary` component is a composite component that displays a title or a Quantic Query Summary depending whether a user query is performed.
 * @category Insight Panel
 * @example
 * <c-quantic-insight-query-summary engine-id={engineId}></c-quantic-insight-query-summary>
 */
export default class QuanticInsightPanelSummary extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  labels = {
    insightRelatedToThisCase,
  };

  /** @type {boolean} */
  showQuerySummary = false;
  /** @type {boolean} */
  hasError = false;

  /** @type {AnyHeadless} */
  headless;
  /** @type {SearchBox} */
  searchBox;
  /** @type {QuerySummary} */
  querySummary;
  /** @type {boolean} */
  hasInitializationError;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {InsightEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.searchBox = this.headless.buildSearchBox(engine);
    this.querySummary = this.headless.buildQuerySummary(engine);
    this.unsubscribeSearchBox = this.searchBox.subscribe(() =>
      this.updateSummaryVisibility()
    );
    this.unsubscribeQuerySummary = this.querySummary.subscribe(() =>
      this.updateHasError()
    );
  };

  disconnectedCallback() {
    this.unsubscribeSearchBox?.();
    this.unsubscribeQuerySummary?.();
  }

  /**
   * Updates summary visibility.
   * @returns {void}
   */
  updateSummaryVisibility() {
    this.showQuerySummary = !!this.searchBox.state.value;
  }

  /**
   * updates the error state of the component.
   * @returns {void}
   */
  updateHasError() {
    this.hasError = this.querySummary?.state?.hasError;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}
