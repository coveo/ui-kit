import {LightningElement, api, track} from 'lwc';
import {getHeadlessEngine, registerComponentForInit, setComponentInitialized} from 'c/headlessLoader';

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
    try {
      getHeadlessEngine(this).then((engine) => {
        this.initialize(engine);
        setComponentInitialized(this);
      })
    } catch (error) {
      console.error('Fatal error: unable to initialize component', error);
    }
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
