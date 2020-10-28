import {LightningElement, track, api} from 'lwc';
import {initializeComponent} from 'c/initialization';

export default class Summary extends LightningElement {
  @track state = {};

  /** @type {import("coveo").QuerySummary} */
  querySummary;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  connectedCallback() {
    initializeComponent(this);
  }

  /**
   * @param {import("coveo").Engine} engine
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

  get forQuery() {
    return this.state.hasQuery ? ` for ${this.state.query}` : '';
  }

  get range() {
    return ` ${this.state.firstResult} - ${this.state.lastResult}`;
  }

  get total() {
    return ` of ${this.state.total.toString()}`;
  }

  get duration() {
    if (this.state.hasDuration) {
      return ` in ${this.state.durationInSeconds} seconds`;
    }

    return '';
  }
}
