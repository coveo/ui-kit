import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticSort extends LightningElement {
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Sort} */
  sort;
  /** @type {import("coveo").SearchStatus} */
  searchStatus;

  /** @type {() => void} */
  unsubscribeSort;
  /** @type {() => void} */
  unsubscribeSearchStatus;

  /**
   * @type {boolean}
   */
  @track hasResults

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
    this.sort = CoveoHeadless.buildSort(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribeSort = this.sort.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribeSearchStatus) {
      this.unsubscribeSearchStatus();
    }
    if(this.unsubscribeSort) {
        this.unsubscribeSort();
    }
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
    return CoveoHeadless.buildDateSortCriterion(CoveoHeadless.SortOrder.Descending)
  }
  
  get dateAscending() {
    return CoveoHeadless.buildDateSortCriterion(CoveoHeadless.SortOrder.Ascending)
  }

  get largest() {
    return CoveoHeadless.buildFieldSortCriterion('size', CoveoHeadless.SortOrder.Descending)
  }

  get options() {
    return [
      {label: 'Relevancy', value: 'relevancy'},
      {label: 'Newest', value: 'newest'},
      {label: 'Oldest', value: 'oldest'},
    ];
  }

  get value() {
    if (!this.sort) {
      return 'relevancy';
    }
    return this.state.sortCriteria.expression;
  }
}
