import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultAction` component allows the end user to perform a specific action on a result.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-result-action result={result} event-name="attachtocase" icon-name="utility:chat" label="Attach result" selected selected-label="Detach result"></c-quantic-result-action>
 */
export default class QuanticResultAction extends LightningElement {
  /**
   * The label displayed in the tooltip of the result action button.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The label displayed in the tooltip when the result action button is selected.
   * @api
   * @type {string}
   */
  @api selectedLabel;
  /**
   * The name of the icon displayed inside the result action button.
   * @api
   * @type {string}
   */
  @api iconName;
  /**
   * Specifies whether the result action button is in selected state or not.
   * @api
   * @type {boolean}
   */
  @api selected;
  /**
   * Specifies whether the result action button is in loading state or not.
   * @api
   * @type {boolean}
   */
  @api loading;
  /**
   * The name of the event to be dispatched.
   * @api
   * @type {string}
   */
  @api eventName;
  /**
   * The result to perform the action on.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The name of the icon displayed inside the result action button when the result action button is selected.
   * @api
   * @type {string}
   */
  @api selectedIconName;

  /** @type {string} */
  resultActionOrderClasses;
  /** @type {boolean} */
  _selected;
  /** @type {boolean} */
  _loading;

  connectedCallback() {
    this.setSelected(this.selected);
    this.setLoading(this.loading);

    const resultActionRegister = new CustomEvent(
      'quantic__resultactionregister',
      {
        bubbles: true,
        composed: true,
        detail: {
          applyCssOrderClass: this.applyCssOrderClass,
        },
      }
    );
    this.dispatchEvent(resultActionRegister);
  }

  /**
   * Applies the proper CSS order class.
   * This method is inspired from how the lightning-button-group component works:
   * https://github.com/salesforce/base-components-recipes/blob/master/force-app/main/default/lwc/buttonGroup/buttonGroup.js
   * @param {'first' | 'middle' | 'last'} order
   */
  applyCssOrderClass = (order) => {
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
   * Sets the loading state.
   * @param {boolean} value
   */
  setLoading = (value) => {
    this._loading = value;
  };

  /**
   * Sets the selected state
   * @param {boolean} value
   */
  setSelected = (value) => {
    this._selected = value;
  };

  /**
   * Dispatches a custon event.
   */
  handleClick(event) {
    event.stopPropagation();
    const resultCopy = {...this.result};
    const resultActionEvent = new CustomEvent(this.eventName, {
      bubbles: true,
      composed: true,
      detail: {
        result: resultCopy,
        setLoading: this.setLoading,
        setSelected: this.setSelected,
        state: this._selected,
      },
    });

    this.dispatchEvent(resultActionEvent);
  }

  /**
   * Returns the label to be displayed in the tooltip.
   */
  get displayedLabel() {
    return this._selected && this.selectedLabel
      ? this.selectedLabel
      : this.label;
  }

  /**
   * Returns the icon name to be displayed in the result action button.
   */
  get displayedIcon() {
    return this._selected && this.selectedIconName
      ? this.selectedIconName
      : this.iconName;
  }

  /**
   * Returns the CSS classes to be used in the loading state.
   */
  get loadingClasses() {
    return `slds-button slds-button_icon slds-button_icon-border-filled ${this.resultActionOrderClasses}`;
  }
}
