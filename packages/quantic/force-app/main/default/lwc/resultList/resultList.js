import {LightningElement, api, track} from 'lwc';
import {initializeComponent} from 'c/initialization';

export default class ResultList extends LightningElement {
  @track state = {};

  /** @type {import("coveo").ResultList} */
  resultList;

  /** @type {import("coveo").Unsubscribe} */
  unsubscribe;

  /** @type {import("coveo").ResultTemplatesManager} */
  resultTemplatesManager;

  connectedCallback() {
    initializeComponent(this);
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.resultList = CoveoHeadless.buildResultList(engine);
    this.resultTemplatesManager = new CoveoHeadless.ResultTemplatesManager(
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
