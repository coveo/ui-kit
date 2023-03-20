import { getHeadlessBundle, getHeadlessEnginePromise } from 'c/quanticHeadlessLoader';
import { ResultUtils } from 'c/quanticUtils';
import { LightningElement, api, track } from 'lwc';
// @ts-ignore
import defaultTemplate from './quanticQuickviewDefault.html';
// @ts-ignore
import youtubeTemplate from './quanticQuickviewYoutube.html';


/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").Quickview} Quickview */
/** @typedef {import("coveo").QuickviewState} QuickviewState */

export default class QuanticQuickviewContent extends LightningElement {
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
   * Whether the component is loading.
   * @api
   * @type {Boolean}
   */
  @api isLoading;
  /**
   * contentUrl.
   * @api
   * @type {String}
   */
  @api contentUrl;

  /** @type {QuickviewState} */
  @track state;

  /** @type {Quickview} */
  quickview;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;
  // /** @type {boolean} */
  // _isLoading = false;

  connectedCallback() {
    getHeadlessEnginePromise(this.engineId)
      .then((engine) => {
        this.initialize(engine);
      })
      .catch((error) => {
        console.error('patate' + error.message);
      });
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.engine = engine;
    ResultUtils.bindClickEventsOnResult(
      this.engine,
      this.result,
      this.template,
      this.headless.buildInteractiveResult
    );
  };

  get contentURI() {
    return this.contentUrl;
  }

  get youtubeURL() {
    const videoId = this.result?.clickUri.split('=').pop();
    return 'https://www.youtube.com/embed/' + videoId;
  }

  handleIframeLoaded() {
    this.dispatchEvent(new CustomEvent('iframeloaded', {
      detail: {
        isloading: false,
      }
    }));
  }

  render() {
    if (this.result?.clickUri.includes('watch?v=')) {
      return youtubeTemplate;
    }
    return defaultTemplate;
  }
}