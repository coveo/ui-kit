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

/** @typedef {import("coveo").RecentResultsState} RecentResultsState */
/** @typedef {import("coveo").RecentResultsList} RecentResultsList */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticRecentResultsList` component displays the current user's recently clicked results.
 * @category LWC
 * @example
 * <c-quantic-recent-results-list engine-id={engineId}></c-quantic-recent-results-list>
 */
export default class QuanticRecentResultsList extends LightningElement {
  labels = {
    emptyListLabel,
    recentResultsLabel,
    collapse,
    expand,
  }

  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The maximum number of queries to keep in the list.
   * @api
   * @type {number}
   */
  @api maxLength = 10;
  /**
   * The non-localized label for the component.
   * @api
   * @type {string}
   */
  @api label = this.labels.recentResultsLabel;

  /** @type {RecentResultsState} */
  @track state;

  /** @type {RecentResultsList} */
  recentResultsList;
  /** @type {boolean} */
  isExpanded = true;
  /** @type {Function} */
  unsubscribe;

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