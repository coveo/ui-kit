import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").ResultsPerPage} ResultsPerPage */

/**
 * The `QuanticResultsPerPage` component determines how many results to display per page.
 * @category LWC
 * @example
 * <c-quantic-results-per-page engine-id={engineId}></c-quantic-results-per-page>
 */
export default class QuanticResultsPerPage extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {boolean}*/
  @track hasResults

  /** @type {ResultsPerPage} */
  resultsPerPage;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {number} */
  currentResultsPerPageValue;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  
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
    this.resultsPerPage = CoveoHeadless.buildResultsPerPage(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.resultsPerPage.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.currentResultsPerPageValue = this.resultsPerPage.state.numberOfResults;
    this.hasResults = this.searchStatus.state.hasResults;
  }

  /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.resultsPerPage.set(event.detail);
  }

  resultsPerPageOptions = [10, 25, 50, 100];
}
