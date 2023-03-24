import { LightningElement, api } from 'lwc';
// @ts-ignore
import defaultTemplate from './quanticQuickviewDefault.html';
// @ts-ignore
import youtubeTemplate from './quanticQuickviewYoutube.html';


/** @typedef {import("coveo").Result} Result */

const allowedHost = ['https://youtube.com/'];

/**
 * The `QuanticQuickviewContent` component renders a content template based on the type of the content (Youtube, other).
 * @category Result Template
 * @example
 * <c-quantic-quickview-content result={result} content-url={contentURL}></c-quantic-quickview-content>
 * @internal
 */
export default class QuanticQuickviewContent extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result).
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * src used to render the iframe when content type is not youtube.
   * @api
   * @type {String}
   */
  @api contentUrl;

  /** @type {Boolean} */
  isLoading = true;

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