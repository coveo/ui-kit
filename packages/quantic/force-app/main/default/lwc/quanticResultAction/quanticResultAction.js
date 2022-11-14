import { LightningElement, api } from 'lwc';

export default class QuanticResultAction extends LightningElement {
  /**
   * @api
   * @type {string}
   */
  @api labelWhenHover;
  /**
   * @api
   * @type {string}
   */
  @api labelWhenOn;
  /**
   * @api
   * @type {string}
   */
  @api labelWhenOff;
  /**
   * @api
   * @type {string}
   */
  @api iconName;
  /**
   * @api
   * @type {boolean}
   */
  @api toggleMode;
  /**
   * @api
   * @type {boolean}
   */
  @api selected;

  /** @type {string} */
  resultActionOrderClasses;

  connectedCallback() {
    const resultActionRegister = new CustomEvent('resultactionregister', {
      bubbles: true,
      detail: {
        callbacks: {
          setOrder: this.setOrder,
        },
      },
    });

    this.dispatchEvent(resultActionRegister);
  }

  /**
   * Sets the correct order on the result action button.
   * @param {'first' | 'middle' | 'last'} order
   */
  setOrder = (order) => {
    const commonButtonClass = 'result-action_button';
    let orderClass = '';

    if (order === 'first') {
      orderClass = 'result-action_first';
    } else if (order === 'middle') {
      orderClass = 'result-action_middle';
    } else if (order === 'last') {
      orderClass = 'result-action_last';
    }
    this.resultActionOrderClasses = orderClass ? `${commonButtonClass} ${orderClass}` : commonButtonClass;
  };

  get displayedLabel() {
    return !this.toggleMode ? this.labelWhenHover : this.selected ? this.labelWhenOn : this.labelWhenOff;
  }
}
