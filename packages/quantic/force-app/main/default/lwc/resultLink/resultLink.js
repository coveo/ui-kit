import {LightningElement, api} from 'lwc';
import {initializeComponent} from 'c/initialization';

export default class ResultLink extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;

  /** @type {import("coveo").Engine} */
  engine;
  connectedCallback() {
    initializeComponent(this);
  }

  /**
   * @param {import("coveo").Engine} engine
   */
  @api
  initialize(engine) {
    this.engine = engine;
  }

  renderedCallback() {
    CoveoAtomicUtils.bindLogDocumentOpenOnResult(
      this.engine,
      this.result,
      /** @type {any} */ (this.template)
    );
  }
}
