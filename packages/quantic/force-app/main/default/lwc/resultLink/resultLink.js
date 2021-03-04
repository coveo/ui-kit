import {LightningElement, api} from 'lwc';
import {getHeadlessEngine} from 'c/headlessLoader';

export default class ResultLink extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Engine} */
  engine;

  connectedCallback() {
    getHeadlessEngine(this, this.engineId).then((engine) => {
      this.initialize(engine);
    }).catch((error) => {
      console.error(error.message);
    });
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
