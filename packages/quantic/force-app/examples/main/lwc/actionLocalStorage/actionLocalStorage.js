import {api, LightningElement} from 'lwc';

export default class ActionLocalStorage extends LightningElement {
  @api storageKey;

  inputValue = '';
  outputValue = '';

  handleInputChange(event) {
    this.inputValue = event.target.value;
  }

  handleSetValue() {
    if (this.storageKey) {
      localStorage.setItem(this.storageKey, this.inputValue);
    }
  }

  handlePrintValue() {
    if (this.storageKey) {
      this.outputValue = localStorage.getItem(this.storageKey) || '';
    }
  }

  get inputLabel() {
    return `Set value for key "${this.storageKey}":`;
  }
}
