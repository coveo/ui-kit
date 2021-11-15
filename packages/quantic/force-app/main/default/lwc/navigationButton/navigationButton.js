import { LightningElement, api } from 'lwc';

export default class NavigationButton extends LightningElement {
  /**
   * The type of the navigation button.
   * @type {'next'|'previous'}
   */
  @api type = 'next';

  /**
   * The label to be shown in the button.
   */
  @api label = 'Navigate';

  /**
   * Returns the variant of the button.
   * @type {string}
   */
  get variant() {
    return this.type === 'next' ? 'brand' : 'brand-outline'
  }

  /**
   * Hamdles clinks on the navigation button.
   * @returns {void}
   */
  handleNavigate() {
    if (this.type === 'next') {
      this.dispatchEvent(new CustomEvent('next'))
    } else {
      this.dispatchEvent(new CustomEvent('previous'))
    }
  }
}