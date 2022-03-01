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
/** @typedef {import("coveo").SortCriterion} SortCriterion */
/**
 * @typedef SortOption
 * @property {string} label
 * @property {string} value
 * @property {SortCriterion} criterion
 */

/**
 * The `QuanticSort` component renders a dropdown that the end user can interact with to select the criterion to use when sorting query results.
 * @category Search
 * @example
 * <c-quantic-sort engine-id={engineId}></c-quantic-sort>
 */
export default class QuanticSort extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
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
  /** @type {Array.<SortOption>} */
  options;

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
    this.options = this.buildOptions();
    this.sort = CoveoHeadless.buildSort(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSort = this.sort.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
  }

  disconnectedCallback() {
    this.unsubscribeSort?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.sort?.state;
    this.hasResults = this.searchStatus?.state?.hasResults;
  }

  buildOptions() {
    return [
      {
        label: this.labels.relevancy,
        value: CoveoHeadless.buildCriterionExpression(this.relevancy),
        criterion: this.relevancy,
      },
      {
        label: this.labels.newest,
        value: CoveoHeadless.buildCriterionExpression(this.dateDescending),
        criterion: this.dateDescending},
      {
        label: this.labels.oldest,
        value: CoveoHeadless.buildCriterionExpression(this.dateAscending),
        criterion: this.dateAscending,
      },
    ];
  }

  /**
   * @param {CustomEvent<{value: string}>} e
   */
  handleChange(e) {
    this.sort.sortBy(this.options.find((option) => option.value === e.detail.value).criterion);
  }

  get relevancy() {
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

  get value() {
    return this.state?.sortCriteria;
  }
}
