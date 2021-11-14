import { LightningElement, api } from 'lwc';

export default class NavigationButton extends LightningElement {
  @api type = 'next';
  @api label = 'Navigate';

  get variant() {
    return this.type === 'next' ? 'brand' : 'brand-outline'
  }

  handleNavigate() {
    if (this.type === 'next') {
      this.dispatchEvent(new CustomEvent('next'))
    } else {
      this.dispatchEvent(new CustomEvent('previous'))
    }
  }
}