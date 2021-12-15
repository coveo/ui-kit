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
 * The `QuanticRecentQueriesList` component displays the user's recent queries.
 * @category Search
 * @example
 * <c-quantic-recent-queries-list engine-id={engineId} max-length="8" label="Recent Searches" is-collapsed></c-quantic-recent-queries-list>
 */
export default class QuanticRecentQueriesList extends LightningElement {
  labels = {
    recentQueriesLabel,
    emptyListLabel,
    collapse,
    expand
  }

  /**
   * The ID of the engine instance the component registers to.
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
   * The non-localized label for the component. This label is displayed in the component header.
   * @api
   * @type {string}
   */
  @api label = this.labels.recentQueriesLabel;
  /**
   * Whether the component is collapsed.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api get isCollapsed() {
    return this._isCollapsed;
  }
  set isCollapsed(collapsed) {
    this._isCollapsed = collapsed;
  }
  /** @type {boolean} */
  _isCollapsed = false;

  /** @type {RecentQueriesState} */
  @track state;
  
  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {RecentQueriesList} */
  recentQueriesList;
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
    if (this.state?.queries) {
      setItemInLocalStorage(this.localStorageKey, this.recentQueriesList.state.queries);
      this.showPlaceholder = false;
    }
  }

  executeQuery(e) {
    this.recentQueriesList.executeRecentQuery(e.currentTarget.value);
  }

  toggleVisibility() {
    this._isCollapsed = !this.isCollapsed;
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
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed ? this.labels.expand : this.labels.collapse;
    return I18nUtils.format(label, this.label);
  }
}