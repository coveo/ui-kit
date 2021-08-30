import {LightningElement, api} from 'lwc';

export default class QuanticFacetValue extends LightningElement {
  @api item;
  /** @type {boolean} */
  @api isChecked;
  /** @type {string} */
  @api variant = 'standard';
  /** @type {(any) => string} */
  @api formattingFunction;

  get isStandardFacet() {
    return !this.formattingFunction;
  }

  get formattedFacetValue() {
    if (this.formattingFunction instanceof Function) {
      return this.formattingFunction(this.item);
    }
    return this.item.value;
  }

  /**
   * @param {InputEvent} evt
   */
  onSelect(evt) {
    evt.preventDefault();
    this.dispatchEvent(new CustomEvent('selectvalue', {detail: this.item}));
  }
}
