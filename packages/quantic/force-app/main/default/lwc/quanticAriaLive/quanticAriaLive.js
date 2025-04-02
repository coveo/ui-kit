import {LightningElement, track, api} from 'lwc';

/**
 * @typedef AriaLiveRegion
 * @property {string} message
 * @property {'assertive' | 'polite'} assertive
 */

/**
 * @typedef {Object} IQuanticAriaLive
 * @method registerRegion
 * @method updateMessage
 */

/**
 * An aria live region provides a way to programmatically expose dynamic content changes in a way that can be announced by assistive technologies.
 * Dynamic content changes without a page reload should generally be accompanied by an announcement for assistive technologies.
 * Add this component inside the `quantic-search-interface` markup so other components can send messages when content changes.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-search-interface>
 *     <c-quantic-aria-live></c-quantic-aria-live>
 *      [...]
 * </c-quantic-search-interface>
 */
export default class QuanticAriaLive extends LightningElement {
  /** @type {Record<string, AriaLiveRegion>} */
  @track regions = {};

  get regionsToDisplay() {
    return Object.keys(this.regions).map((region) => ({
      region,
      ...this.regions[region],
    }));
  }

  /**
   * Register a new aria-live region.
   * @param {string} regionName
   * @param {boolean} assertive
   */
  @api registerRegion(regionName, assertive = false) {
    if (regionName in this.regions) {
      return;
    }
    this.regions = {
      ...this.regions,
      [regionName]: {
        message: '',
        assertive: assertive ? 'assertive' : 'polite',
      },
    };
  }

  /**
   * Update the current message of a given region.
   * @param {string} regionName
   * @param {string} message
   * @param {boolean} assertive
   */
  @api updateMessage(regionName, message, assertive = false) {
    this.regions = {
      ...this.regions,
      [regionName]: {message, assertive: assertive ? 'assertive' : 'polite'},
    };
  }
}
