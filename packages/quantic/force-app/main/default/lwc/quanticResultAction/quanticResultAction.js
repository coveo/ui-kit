import {LightningElement, api} from 'lwc';

/**
 * The `QuanticResultAction` component allows the end user to perform a specific action on a result.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-result-action onclick={action} icon-name="utility:chat" label-when-hover="Label"></c-quantic-result-action>
 */
export default class QuanticResultAction extends LightningElement {
  /**
   * The label displayed in the tooltip. This property takes effect when the toggle mode is disabled.
   * @api
   * @type {string}
   */
  @api labelWhenHover;
  /**
   * The label displayed in the tooltip when the result action button is selected. This property takes effect when the toggle mode is enabled.
   * @api
   * @type {string}
   */
  @api labelWhenOn;
  /**
   * The label displayed in the tooltip when the result action button is not selected. This property takes effect when the toggle mode is enabled.
   * @api
   * @type {string}
   */
  @api labelWhenOff;
  /**
   * The name of the icon displayed inside the result action button.
   * @api
   * @type {string}
   */
  @api iconName;
  /**
   * Specifies whether the toggle mode is enabled or not.
   * @api
   * @type {boolean}
   */
  @api toggleMode;
  /**
   * Specifies whether the result action button is in selected state or not.
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
        setOrder: this.setOrder,
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
    this.resultActionOrderClasses = orderClass
      ? `${commonButtonClass} ${orderClass}`
      : commonButtonClass;
  };

  /**
   * Returns the label to be dusplayed in the tooltip.
   */
  get displayedLabel() {
    return !this.toggleMode
      ? this.labelWhenHover
      : this.selected
      ? this.labelWhenOn
      : this.labelWhenOff;
  }
}
