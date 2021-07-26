import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/quanticHeadlessLoader';

export default class QuanticPager extends LightningElement {
  /** @type {number[]} */
  @track currentPages = [];
  /** @type {boolean}*/
  @track hasResults

  /** @type {import("coveo").Pager} */
  pager;
  /** @type {()=> void} */
  unsubscribe;
  /** @type {() => void} */
  unsubscribeSearchStatus;
  /** @type {boolean} */
  hasPrevious;
  /** @type {boolean} */
  hasNext;
  currentPage = 1;
  /** @type {string} */
  @api engineId;

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
    this.pager = CoveoHeadless.buildPager(engine);
    this.searchStatus = CoveoHeadless.buildSearchStatus(engine);
    this.unsubscribe = this.pager.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.unsubscribeSearchStatus) {
      this.unsubscribeSearchStatus();
    }
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
}
