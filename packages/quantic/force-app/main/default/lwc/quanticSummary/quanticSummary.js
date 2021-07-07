import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticSummary extends LightningElement {
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").QuerySummary} */
  querySummary;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").SearchEngine} engine
   */
  @api
  initialize(engine) {
    this.querySummary = CoveoHeadless.buildQuerySummary(engine);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  updateState() {
    this.state = this.querySummary.state;
  }

  get hasResults() {
    return this.state.hasResults;
  }

  get hasQuery() {
    return this.state.hasQuery;
  }

  get query() {
    return this.state.hasQuery ? `${this.state.query}` : '';
  }

  get range() {
    return ` ${this.state.firstResult} - ${this.state.lastResult}`;
  }

  get total() {
    return this.state.total.toString();
  }

  get duration() {
    if (this.state.hasDuration) {
      return ` in ${this.state.durationInSeconds} seconds`;
    }

    return '';
  }
}
