import {LightningElement, api, track} from 'lwc';
// @ts-ignore
import defaultTemplate from './quanticQuickviewDefault.html';
// @ts-ignore
import youtubeTemplate from './quanticQuickviewYoutube.html';

/** @typedef {import("coveo").Result} Result */

const allowedHost = ['https://youtube.com/'];

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

  handleIframeLoaded() {
    this.isLoading = false;
  }

  render() {
    if (this.result?.uniqueId.includes(allowedHost[0])) {
      return youtubeTemplate;
    }
    return defaultTemplate;
  }

  get contentURI() {
    return this.contentUrl;
  }

  get youtubeURL() {
    const videoId = this.result?.uniqueId.split('Video:').pop();
    return 'https://www.youtube.com/embed/' + videoId;
  }
}
