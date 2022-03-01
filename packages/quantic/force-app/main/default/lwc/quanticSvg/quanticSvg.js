import { LightningElement, api } from 'lwc';
// @ts-ignore
import pageNotFound from './pageNotFound.html';
// @ts-ignore
import noResults from './noResults.html';
// @ts-ignore
import _default from './default.html';

/**
 * The `QuanticSvg` is used internally to display static svg images.
 * @category Utility
 * @example
 * <c-quantic-svg name="noResults"></c-quantic-svg>
 */
export default class QuanticSvg extends LightningElement {
  /**
   * The name of the image to display.
   * The options are:
   *   - `'pageNotFound'`
   *   - `'noResults'`
   *   - `undefined (default)`
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api name;

  render() {
    switch (this.name) {
      case "pageNotFound":
        return pageNotFound;
      case "noResults":
        return noResults;
      default:
        return _default;
    }   
  }
}