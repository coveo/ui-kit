import {LightningElement, api} from 'lwc';
import {getHeadlessEngine} from 'c/quanticHeadlessLoader';

export default class QuanticResultLink extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;
  /** @type {string} */
  @api engineId;

  /** @type {import("coveo").Engine} */
  engine;

  connectedCallback() {
    getHeadlessEngine(this.engineId).then((engine) => {
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
