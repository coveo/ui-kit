import {LightningElement, track, api} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

import sortBy from '@salesforce/label/c.quantic_SortBy';
import relevancy from '@salesforce/label/c.quantic_Relevancy';
import newest from '@salesforce/label/c.quantic_Newest';
import oldest from '@salesforce/label/c.quantic_Oldest';

export default class QuanticSort extends LightningElement {
  @track state = {};

  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Sort} */
  sort;
  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  labels = {
    sortBy,
    relevancy,
    newest,
    oldest
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
    this.sort = CoveoHeadless.buildSort(engine);
    this.unsubscribe = this.sort.subscribe(() => this.updateState());
  }

  updateState() {
    this.state = this.sort.state;
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
      {label: this.labels.relevancy, value: 'relevancy'},
      {label: this.labels.newest, value: 'newest'},
      {label: this.labels.oldest, value: 'oldest'},
    ];
  }

  get value() {
    if (!this.sort) {
      return 'relevancy';
    }
    return this.state.sortCriteria.expression;
  }
}
