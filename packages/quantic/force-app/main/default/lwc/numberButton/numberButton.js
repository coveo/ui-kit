import {LightningElement, api} from 'lwc';

export default class NumberButton extends LightningElement {
  @api number;
  @api current;

  get isCurrent() {
    return this.number === this.current;
  }

  goto() {
    this.dispatchEvent(new CustomEvent('goto', {detail: this.number}));
  }

  get variant() {
    return this.number === this.current ? 'brand-outline' : 'brand';
  }
}
