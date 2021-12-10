import {LightningElement, api} from 'lwc';
import {getHeadlessEnginePromise} from 'c/quanticHeadlessLoader';
import {ResultUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Result} Result*/

/**
 * The `QuanticRecentResultLink` component is used internally by the `QuanticRecentResultsList` component.
 * @category Search
 * @example
 * <c-quantic-recent-result-link engine-id={engineId} result={result}></c-quantic-recent-result-link>
 */
export default class QuanticRecentResultLink extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
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
  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or <iframe>).
   * The following keywords have special meanings for where to load the URL:
   *   - `_self`: the current browsing context. (Default)
   *   - `_blank`: usually a new tab, but users can configure their browsers to open a new window instead.
   *   - `_parent`: the parent of the current browsing context. If there’s no parent, this behaves as `_self`.
   *   - `_top`: the topmost browsing context (the "highest" context that’s an ancestor of the current one). If there are no ancestors, this behaves as `_self`.
   * @api
   * @type {string}
   * @defaultValue `'_self'`
   */
  @api target = '_self';

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
