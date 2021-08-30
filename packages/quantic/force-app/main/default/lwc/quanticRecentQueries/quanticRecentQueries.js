import { LightningElement, api } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';
import { getItemfromLocalStorage, setIteminLocalStorage } from 'c/quanticUtils';

export default class QuanticRecentQueries extends LightningElement {
  /** @type {import("coveo").RecentQueriesList} */
  recentQueriesList;
  /** @type {()=> void} */
  unsubscribe;
  /** @type {Array} */
  queries = getItemfromLocalStorage('quantic-recent-queries');
  /** @type {number} */
  @api maxLength = 10;
  /** @type {boolean} */
  isCollapsed = false;
  /** @type {string} */
  collapseIconName = 'utility:dash';
  /** @type {string} */
  @api engineId;

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
    this.recentQueriesList = CoveoHeadless.buildRecentQueriesList(engine, {
      initialState: {
        queries: this.queries,
      },
      options: {
        maxLength: this.maxLength,
      },
    });
    this.unsubscribe = this.recentQueriesList.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.queries = this.recentQueriesList.state.queries;
    setIteminLocalStorage('quantic-recent-queries', this.recentQueriesList.state.queries);
  }

  executeQuery(e) {
    this.recentQueriesList.executeRecentQuery(e.target.value);
  }

  get hasQueries() {
    return this.queries.length !== 0;
  }

  toggleVisibility() {
    this.collapseIconName = this.isCollapsed ? 'utility:dash' : 'utility:add';
    this.isCollapsed = !this.isCollapsed;
  }

}