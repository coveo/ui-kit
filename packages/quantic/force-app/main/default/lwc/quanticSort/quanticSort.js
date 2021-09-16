import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
} from 'c/quanticHeadlessLoader';

import sortBy from '@salesforce/label/c.quantic_SortBy';
import relevancy from '@salesforce/label/c.quantic_Relevancy';
import newest from '@salesforce/label/c.quantic_Newest';
import oldest from '@salesforce/label/c.quantic_Oldest';

/** @typedef {import("coveo").Sort} Sort */
/** @typedef {import("coveo").SortState} SortState */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticSort` component renders a dropdown that the end user can interact with to select the criteria to use when sorting query results.
 * @category LWC
 * @example
 * <c-quantic-sort engine-id={engineId}></c-quantic-sort>
 */
export default class QuanticSort extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {boolean} */
  @track hasResults;
  /** @type {SortState} */
  @track state;

  /** @type {Sort} */
  sort;
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {Function} */
  unsubscribeSort;
  /** @type {Function} */
  unsubscribeSearchStatus;

  labels = {
    sortBy,
    relevancy,
    newest,
    oldest,
  };

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
    this.sort = CoveoHeadless.buildSort(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSort = this.sort.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
  }

  disconnectedCallback() {
    this.unsubscribeSearchStatus?.();
    this.unsubscribeSort?.();
  }

  updateState() {
    this.state = this.sort.state;
    this.hasResults = this.searchStatus.state.hasResults;
  }

  /**
   * @param {CustomEvent<{value: string}>} e
   */
  handleChange(e) {
    const selected = e.detail.value;

    switch (selected) {
      case 'relevancy':
        this.sort.sortBy(this.relevance);
        break;

      case 'newest':
        this.sort.sortBy(this.dateDescending);
        break;

      case 'oldest':
        this.sort.sortBy(this.dateAscending);
        break;

      default:
        break;
    }
  }

  get relevance() {
    return CoveoHeadless.buildRelevanceSortCriterion();
  }

  get dateDescending() {
    return CoveoHeadless.buildDateSortCriterion(
      CoveoHeadless.SortOrder.Descending
    );
  }

  get dateAscending() {
    return CoveoHeadless.buildDateSortCriterion(
      CoveoHeadless.SortOrder.Ascending
    );
  }

  get largest() {
    return CoveoHeadless.buildFieldSortCriterion(
      'size',
      CoveoHeadless.SortOrder.Descending
    );
  }

  get options() {
    return [
      {label: this.labels.relevancy, value: 'relevancy'},
      {label: this.labels.newest, value: 'newest'},
      {label: this.labels.oldest, value: 'oldest'},
    ];
  }

  get value() {
    if (!this.sort || !this.state?.sortCriteria) {
      return 'relevancy';
    }
    return this.state?.sortCriteria;
  }
}
