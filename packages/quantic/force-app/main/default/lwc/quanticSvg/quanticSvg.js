import {LightningElement, api} from 'lwc';
// @ts-ignore
import _default from './default.html';
// @ts-ignore
import noResults from './noResults.html';
// @ts-ignore
import noEvents from './noEvents.html';
// @ts-ignore
import pageNotFound from './pageNotFound.html';
// @ts-ignore
import success from './success.html';

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
   *   - `'noEvents'`
   *   - `'success'`
   *   - `undefined (default)`
   * @api
   * @type {string}
   * @defaultValue `undefined`
   */
  @api name;

  render() {
    switch (this.name) {
      case 'pageNotFound':
        return pageNotFound;
      case 'noResults':
        return noResults;
      case 'noEvents':
        return noEvents;
      case 'success':
        return success;
      default:
        return _default;
    }
  }
}
