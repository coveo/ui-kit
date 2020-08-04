// @ts-check
import {LightningElement, track, api} from 'lwc';

export default class Summary extends LightningElement {
  @track state = {};

  /** @type {import("coveo").QuerySummary} */
  querySummary;
  /** @type {() => any} */
  unsubscribe;

  @api
  set engine(eng) {
    if (!eng) {
      return;
    }

    this.e = eng;
    this.querySummary = CoveoHeadless.buildQuerySummary(this.e);
    this.unsubscribe = this.querySummary.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe && this.unsubscribe();
  }

  get engine() {
    return this.e;
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
