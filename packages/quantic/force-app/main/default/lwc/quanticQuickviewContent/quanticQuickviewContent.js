import {LightningElement, api} from 'lwc';
// @ts-ignore
import defaultTemplate from './quanticQuickviewDefault.html';
// @ts-ignore
import youtubeTemplate from './quanticQuickviewYoutube.html';

/** @typedef {import("coveo").Result} Result */

const allowedHost = {youtube: 'https://youtube.com/'};

/**
 * The `QuanticQuickviewContent` component renders a content template based on the type of the content (Youtube, other).
 * @category Internal
 * @example
 * <c-quantic-quickview-content result={result} content-url={contentURL}></c-quantic-quickview-content>
 */
export default class QuanticQuickviewContent extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html).
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The `src` path used to render the iframe when content type is not youtube.
   * @api
   * @type {String}
   */
  @api contentUrl;

  /** @type {Boolean} */
  isLoading = true;

  handleIframeLoaded() {
    this.isLoading = false;
    this.dispatchEvent(new CustomEvent('quantic__loadingstatechange'));
  }

  stopPropagation(evt) {
    evt.stopPropagation();
  }

  render() {
    if (this.result?.uniqueId.includes(allowedHost.youtube)) {
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
