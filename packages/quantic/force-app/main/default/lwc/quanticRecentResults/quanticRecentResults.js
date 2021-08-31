import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {getItemfromLocalStorage, setIteminLocalStorage} from 'c/quanticUtils';

import emptyListLabel from '@salesforce/label/c.quantic_EmptyRecentResultListLabel';

export default class QuanticRecentResults extends LightningElement {
  /** @type {import("coveo").RecentResultsState} */
  @track state;

  /** @type {string} */
  @api engineId;
  /** @type {number} */
  @api maxLength = 10;
  /** @type {string} */
  @api label;

  /** @type {string} */
  localStorageKey = 'quantic-recent-results';
  /** @type {boolean} */
  isCollapsed = false;
  /** @type {string} */
  collapseIcon = 'utility:dash';
  /** @type {import("coveo").RecentResultsList} */
  recentResultsList;

  /** @type {() => void} */
  unsubscribe;

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
    this.recentResultsList = CoveoHeadless.buildRecentResultsList(engine, {
      initialState: {
        results: getItemfromLocalStorage(this.localStorageKey) ?? []
      },
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
    setIteminLocalStorage(this.localStorageKey, this.state.results)
  }

  toggleVisibility() {
    this.collapseIcon = this.isCollapsed ? 'utility:dash' : 'utility:add';
    this.isCollapsed = !this.isCollapsed;
  }

  get results() {
    return this.state?.results ?? [];
  }

  get hasResults() {
    return !!this.results.length;
  }
}