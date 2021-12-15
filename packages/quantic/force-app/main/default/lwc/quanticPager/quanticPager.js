import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

import next from '@salesforce/label/c.quantic_Next';
import previous from '@salesforce/label/c.quantic_Previous';

/** @typedef {import("coveo").Pager} Pager */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticPager` provides buttons that allow the end user to navigate through the different result pages.
 * @category Search
 * @example
 * <c-quantic-pager engine-id={engineId} number-of-pages="4"></c-quantic-pager>
 */
export default class QuanticPager extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * Specifies how many page buttons to display in the pager.
   * @api
   * @type {number}
   * @defaultValue 5
   */
  @api numberOfPages = 5;

  /** @type {number[]} */
  @track currentPages = [];
  /** @type {boolean}*/
  @track hasResults

  /** @type {Pager} */
  pager;
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;
  /** @type {boolean} */
  hasPrevious;
  /** @type {boolean} */
  hasNext;
  /** @type {number} */
  currentPage = 1;

  labels = {
    next,
    previous
  }

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
    this.pager = CoveoHeadless.buildPager(engine, {
      options: {
        numberOfPages: Number(this.numberOfPages),
      }
    });
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.pager.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.hasPrevious = this.pager.state.hasPreviousPage;
    this.hasNext = this.pager.state.hasNextPage;
    this.currentPages = this.pager.state.currentPages;
    this.currentPage = this.pager.state.currentPage;
    this.hasResults = this.searchStatus.state.hasResults;
  }

  previous() {
    this.pager.previousPage();
  }

  next() {
    this.pager.nextPage();
  }

  /**
   * @param {CustomEvent<number>} event
   */
  goto(event) {
    this.pager.selectPage(event.detail);
  }

  get nextDisabled() {
    return !this.hasNext;
  }

  get previousDisabled() {
    return !this.hasPrevious;
  }

  get currentPagesObjects() {
    return this.currentPages.map((page) => ({
      number: page,
      selected: page === this.currentPage
    }));
  }
}
