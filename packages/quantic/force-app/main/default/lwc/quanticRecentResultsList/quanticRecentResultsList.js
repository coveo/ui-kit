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
 * @category Search
 * @example
 * <c-quantic-recent-results-list engine-id={engineId} max-length="8" label="Recently Viewed Results" is-collapsed></c-quantic-recent-results-list>
 */
export default class QuanticRecentResultsList extends LightningElement {
  labels = {
    emptyListLabel,
    recentResultsLabel,
    collapse,
    expand,
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
  @api label = this.labels.recentResultsLabel;
  /**
   * Where to display the linked URLs, as the name for a browsing context (a tab, window, or <iframe>).
   * The following keywords have special meanings for where to load the URL:
   *   - `_self`: the current browsing context. (Default)
   *   - `_blank`: usually a new tab, but users can configure their browsers to open a new window instead.
   *   - `_parent`: the parent of the current browsing context. If there’s no parent, this behaves as `_self`.
   *   - `_top`: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`.
   * @api
   * @type {string}
   * @defaultValue `'_self'`
   */
  @api target = '_self';
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


  /** @type {RecentResultsState} */
  @track state;

  /** @type {boolean} */
  showPlaceholder = true;
  /** @type {RecentResultsList} */
  recentResultsList;
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
    if (this.state?.results) {
      setItemInLocalStorage(this.localStorageKey, this.state.results)
      this.showPlaceholder = false;
    }
  }

  toggleVisibility() {
    this._isCollapsed = !this.isCollapsed;
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
    return this.isCollapsed ? 'utility:add' : 'utility:dash';
  }

  get actionButtonLabel() {
    const label = this.isCollapsed ? this.labels.expand : this.labels.collapse;
    return I18nUtils.format(label, this.label);
  }
}