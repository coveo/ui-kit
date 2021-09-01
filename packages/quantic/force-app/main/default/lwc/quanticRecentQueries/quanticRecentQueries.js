import { LightningElement, api, track } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';
import { getItemFromLocalStorage, setItemInLocalStorage } from 'c/quanticUtils';
import emptyListLabel from '@salesforce/label/c.quantic_EmptyRecentQueriesLabel';

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
  /** @type {number} */
  @api maxLength = 10;

  labels = {
    emptyListLabel,
  }

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
        queries: getItemFromLocalStorage(this.localStorageKey) ?? [],
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
    this.state = { ...this.recentQueriesList.state };
    setItemInLocalStorage('quantic-recent-queries', this.recentQueriesList.state.queries);
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

  get hasQueries() {
    return !!this.queries.length;
  }

  get localStorageKey() {
    return `${this.engineId}_quantic-recent-queries`;
  }
}