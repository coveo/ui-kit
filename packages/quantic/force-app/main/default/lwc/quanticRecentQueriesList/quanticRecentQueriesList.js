import { LightningElement, api, track } from 'lwc';
import { registerComponentForInit, initializeWithHeadless } from 'c/quanticHeadlessLoader';
import { I18nUtils, getItemFromLocalStorage, setItemInLocalStorage } from 'c/quanticUtils';

import recentQueriesLabel from '@salesforce/label/c.quantic_RecentQueries';
import emptyListLabel from '@salesforce/label/c.quantic_EmptyRecentQueriesListLabel';
import collapse from '@salesforce/label/c.quantic_Collapse';
import expand from '@salesforce/label/c.quantic_Expand';

/** @typedef {import("coveo").RecentQueriesState} RecentQueriesState */
/** @typedef {import("coveo").RecentQueriesList} RecentQueriesList */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticRecentQueriesList` component displays the current user's recet queries.
 * @category LWC
 * @example
 * <c-quantic-recent-queries-list engine-id={engineId}></c-quantic-recent-queries-list>
 */
export default class QuanticRecentQueriesList extends LightningElement {
  labels = {
    recentQueriesLabel,
    emptyListLabel,
    collapse,
    expand
  }

  /** @type {RecentQueriesState} */
  @track state;

  /** @type {string} */
  @api label = this.labels.recentQueriesLabel;
  /** @type {number} */
  @api maxLength = 10;
  /** @type {string} */
  @api engineId;
  
  /** @type {RecentQueriesList} */
  recentQueriesList;
  /** @type {Function} */
  unsubscribe;
  /** @type {boolean} */
  isExpanded = true;

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
    this.recentQueriesList = CoveoHeadless.buildRecentQueriesList(engine, {
      initialState: {
        queries: getItemFromLocalStorage(this.localStorageKey) ?? [],
      },
      options: {
        maxLength: Number(this.maxLength),
      },
    });
    this.unsubscribe = this.recentQueriesList.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = { ...this.recentQueriesList.state };
    setItemInLocalStorage(this.localStorageKey, this.recentQueriesList.state.queries);
  }

  executeQuery(e) {
    this.recentQueriesList.executeRecentQuery(e.target.value);
  }

  toggleVisibility() {
    this.isExpanded = !this.isExpanded;
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

  get actionButtonIcon() {
    return this.isExpanded ? 'utility:dash' : 'utility:add';
  }

  get actionButtonLabel() {
    const label = this.isExpanded ? this.labels.collapse : this.labels.expand;
    return I18nUtils.format(label, this.label);
  }
}