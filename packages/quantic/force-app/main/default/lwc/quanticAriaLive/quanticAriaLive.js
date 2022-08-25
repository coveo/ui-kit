import { LightningElement, track, api } from 'lwc';

export default class QuanticAriaLive extends LightningElement {
  /** @type {Object.<string, Object>} */
  @track regions = {};

  get regionsToDisplay() {
    return Object.keys(this.regions).map((region) => ({region, ...this.regions[region]}));
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
    this.regions = { ...this.regions, [regionName]: { message: '', assertive: assertive ? 'assertive': 'polite' } };
  }

  /**
   * Update the current message of a given region.
   * @param {string} regionName 
   * @param {string} message 
   * @param {boolean} assertive 
   */
  @api updateMessage(regionName, message, assertive = false) {
    this.regions = { ...this.regions, [regionName]: { message, assertive: assertive ? 'assertive': 'polite'  } };
  }
}