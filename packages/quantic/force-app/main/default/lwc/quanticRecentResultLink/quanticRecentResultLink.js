import {LightningElement, api} from 'lwc';
import {getHeadlessEnginePromise} from 'c/quanticHeadlessLoader';
import {ResultUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Result} Result*/

/**
 * The `QuanticResultLink` component is used internally by the `QuanticRecentResultsList` component.
 * @category LWC
 */
export default class QuanticResultLink extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result item.
   * @api
   * @type {Result}
   */
  @api result;

  /** @type {SearchEngine} */
  engine;

  connectedCallback() {
    getHeadlessEnginePromise(this.engineId).then((engine) => {
      this.initialize(engine);
    }).catch((error) => {
      console.error(error.message);
    });
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.engine = engine;
    ResultUtils.bindClickEventsOnResult(
      this.engine,
      this.result,
      this.template,
      CoveoHeadless.buildInteractiveRecentResult
    );
  }
}
