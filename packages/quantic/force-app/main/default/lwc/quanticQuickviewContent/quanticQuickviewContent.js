import {LightningElement, api, track} from 'lwc';
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
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result).
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * contentUrl.
   * @api
   * @type {String}
   */
  @api contentUrl;

  /** @type {Boolean} */
  @track isLoading = true;

  /** @type {QuickviewState} */
  @track state;

  /** @type {Quickview} */
  quickview;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;

  handleIframeLoaded() {
    this.isLoading = false;
  }

  render() {
    if (this.result?.clickUri.includes('watch?v=')) {
      return youtubeTemplate;
    }
    return defaultTemplate;
  }

  get contentURI() {
    return this.contentUrl;
  }

  get youtubeURL() {
    const videoId = this.result?.clickUri.split('=').pop();
    return 'https://www.youtube.com/embed/' + videoId;
  }
}
