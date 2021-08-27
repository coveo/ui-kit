import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

export default class QuanticRecentResults extends LightningElement {
  /** @type {import("coveo").RecentQueriesState} */
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {number} */
  @api maxLength = 10;

  initialState = {
    results: []
  }

  /** @type {import("coveo").RecentResultsList} */
  recentResultsList;

  /** @type {() => void} */
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
    this.recentResultsList = CoveoHeadless.buildRecentResultsList(engine, {
      initialState: this.initialState,
      options: {
        maxLength: this.maxLength
      }
    });
    this.unsubscribe = this.recentResultsList.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = {...this.recentResultsList.state};
  }

  get results() {
    return this.state.results || [];
  }
}