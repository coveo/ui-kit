import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';
import {I18nUtils, getItemFromLocalStorage, setItemInLocalStorage} from 'c/quanticUtils';

import emptyListLabel from '@salesforce/label/c.quantic_EmptyRecentResultListLabel';
import recentResultsLabel from '@salesforce/label/c.quantic_RecentResults';
import collapse from '@salesforce/label/c.quantic_Collapse';
import expand from '@salesforce/label/c.quantic_Expand';

export default class QuanticRecentResultsList extends LightningElement {
  labels = {
    emptyListLabel,
    recentResultsLabel,
    collapse,
    expand,
  }

  /** @type {import("coveo").RecentResultsState} */
  @track state;

  /** @type {string} */
  @api engineId;
  /** @type {number} */
  @api maxLength = 10;
  /** @type {string} */
  @api label = this.labels.recentResultsLabel;

  /** @type {boolean} */
  isExpanded = true;
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
      initialState: {
        results: getItemFromLocalStorage(this.localStorageKey) ?? []
      },
      options: {
        maxLength: Number(this.maxLength)
      }
    });
    this.unsubscribe = this.recentResultsList.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = {...this.recentResultsList.state};
    setItemInLocalStorage(this.localStorageKey, this.state.results)
  }

  toggleVisibility() {
    this.isExpanded = !this.isExpanded;
  }

  get results() {
    return this.state?.results ?? [];
  }

  get hasResults() {
    return !!this.results.length;
  }

  get localStorageKey() {
    return `${this.engineId}_quantic-recent-results`;
  }

  get actionButtonIcon() {
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }

  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapse : this.labels.expand;
    return I18nUtils.format(label, this.label);
  }
}