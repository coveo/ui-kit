import {LightningElement, api, track} from 'lwc';
import {initializeComponent} from 'c/initialization';
import {getHeadlessEngine} from 'c/headlessLoader';

export default class Pager extends LightningElement {
  /** @type {number[]} */
  @track currentPages = [];

  /** @type {import("coveo").Pager} */
  pager;
  /** @type {()=> void} */
  unsubscribe;
  /** @type {boolean} */
  hasPrevious;
  /** @type {boolean} */
  hasNext;
  currentPage = 1;

  connectedCallback() {
    try {
      getHeadlessEngine(this).then((engine) => {
        this.initialize(engine);
      })
    } catch (error) {
      console.error('Fatal error: unable to initialize component', error);
    }
    initializeComponent(this);
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.pager = CoveoHeadless.buildPager(engine);
    this.unsubscribe = this.pager.subscribe(() => this.updateState());
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.hasPrevious = this.pager.state.hasPreviousPage;
    this.hasNext = this.pager.state.hasNextPage;
    this.currentPages = this.pager.state.currentPages;
    this.currentPage = this.pager.state.currentPage;
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
