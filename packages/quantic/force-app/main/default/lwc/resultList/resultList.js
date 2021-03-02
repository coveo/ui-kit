import {LightningElement, api, track} from 'lwc';
import {registerComponentForInit, initializeWithHeadless} from 'c/headlessLoader';

export default class ResultList extends LightningElement {
  @track state = {};

  /** @type {import("coveo").ResultList} */
  resultList;

  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  /** @type {import("coveo").ResultTemplatesManager} */
  resultTemplatesManager;

  constructor() {
    super();
    registerComponentForInit(this);
  }

  connectedCallback() {
    initializeWithHeadless(this, this.initialize.bind(this));
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.resultList = CoveoHeadless.buildResultList(engine);
    this.resultTemplatesManager = CoveoHeadless.buildResultTemplatesManager(
      engine
    );
    this.registerTemplates();
    this.unsubscribe = this.resultList.subscribe(() => this.updateState());
  }

  registerTemplates() {
    this.dispatchEvent(
      new CustomEvent('registerresulttemplates', {
        bubbles: true,
        detail: this.resultTemplatesManager,
      })
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateState() {
    this.state = this.resultList.state;
  }

  get results() {
    return this.state.results || [];
  }
}
