import {LightningElement, api} from 'lwc';
import {getHeadlessEnginePromise} from 'c/quanticHeadlessLoader';
import {ResultUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").SearchEngine} SearchEngine */

/**
 * The `QuanticResultLink` component creates a clickable link from a result that points to the original item.
 * @category Result Template
 * @example
 * <c-quantic-result-link engine-id={engineId} result={result} target="_blank"></c-quantic-result-link>
 */
export default class QuanticResultLink extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result).
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
  /**
   * Indicates the use case where this component is used.
   * @api
   * @type {'search'|'case-assist'}
   * @defaultValue `'search'`
   */
  @api useCase = 'search';

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
      this.useCase === 'case-assist'
        ? CoveoHeadlessCaseAssist.buildCaseAssistInteractiveResult
        : CoveoHeadless.buildInteractiveResult
    );
  };
}
