import { LightningElement, api, track } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';
import { getItemfromLocalStorage, setIteminLocalStorage } from 'c/quanticUtils';

export default class QuanticRecentQueries extends LightningElement {
  /** @type {import("coveo").RecentQueriesState} */
  @track state;
  /** @type {string} */
  @api label = "Recent Queries";
  /** @type {string} */
  @api engineId;
  /** @type {import("coveo").RecentQueriesList} */
  recentQueriesList;
  /** @type {()=> void} */
  unsubscribe;
  /** @type {boolean} */
  isCollapsed = false;
  /** @type {string} */
  collapseIcon = 'utility:dash';
  /** @type {string} */
  localStorageKey = 'quantic-recent-queries';
  /** @type {number} */
  maxLength = 10;

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
        queries: getItemfromLocalStorage(this.localStorageKey) ?? [],
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
    this.state = this.recentQueriesList.state;
    setIteminLocalStorage('quantic-recent-queries', this.recentQueriesList.state.queries);
  }

  executeQuery(e) {
    this.recentQueriesList.executeRecentQuery(e.target.value);
  }

  toggleVisibility() {
    this.collapseIcon = this.isCollapsed ? 'utility:dash' : 'utility:add';
    this.isCollapsed = !this.isCollapsed;
  }

  get queries() {
    return this.state?.queries ?? []
  }
}