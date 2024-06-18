import newest from '@salesforce/label/c.quantic_Newest';
import oldest from '@salesforce/label/c.quantic_Oldest';
import relevancy from '@salesforce/label/c.quantic_Relevancy';
import sortBy from '@salesforce/label/c.quantic_SortBy';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, track, api} from 'lwc';

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
 * @category Insight Panel
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
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  hasInitializationError = false;

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
    this.headless = getHeadlessBundle(this.engineId);
    this.options = this.buildOptions();
    this.sort = this.headless.buildSort(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.unsubscribeSort = this.sort.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateState()
    );
  };

  disconnectedCallback() {
    this.unsubscribeSort?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.state = this.sort?.state;
    this.hasResults = this.searchStatus?.state?.hasResults;
  }

  buildOptions() {
    if (this.customSortOptions.length > 0) {
      return this.customSortOptions;
    }

    return [
      {
        label: this.labels.relevancy,
        value: this.headless.buildCriterionExpression(this.relevancy),
        criterion: this.relevancy,
      },
      {
        label: this.labels.newest,
        value: this.headless.buildCriterionExpression(this.dateDescending),
        criterion: this.dateDescending,
      },
      {
        label: this.labels.oldest,
        value: this.headless.buildCriterionExpression(this.dateAscending),
        criterion: this.dateAscending,
      },
    ];
  }

  /**
   * @param {CustomEvent<{value: string}>} e
   */
  handleChange(e) {
    this.sort.sortBy(
      this.options.find((option) => option.value === e.detail.value).criterion
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  get relevancy() {
    return this.headless.buildRelevanceSortCriterion();
  }

  get dateDescending() {
    return this.headless.buildDateSortCriterion(
      this.headless.SortOrder.Descending
    );
  }

  get dateAscending() {
    return this.headless.buildDateSortCriterion(
      this.headless.SortOrder.Ascending
    );
  }

  get value() {
    return this.state?.sortCriteria;
  }

  /**
   * Returns an array of custom sort options passed via slots.
   * @returns {SortOption[]} The specified custom sort options.
   */
  get customSortOptions() {
    /** @type {SortOption[]} */
    // @ts-ignore
    const elements = Array.from(this.querySelectorAll('c-quantic-sort-option'));
    if (elements.length === 0) {
      return [];
    }
    return elements.map((element) => {
      return {
        label: element.label,
        value: element.value,
        criterion: {
          by: element.criterion.by,
          // @ts-ignore
          order: element.criterion.order,
          // @ts-ignore
          field: element.criterion.field,
        },
      };
    });
  }
}
