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
   * The name of the event to be dispatched.
   * @api
   * @type {string}
   */
  @api eventName;
  /**
   * The result to perform the action on.
   * @api
   * @type {Result}
   * @deprecated The component no longer needs a result.
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

  /**
   * Specifies whether the result action button is in selected state or not.
   * @api
   * @type {boolean}
   */
  @api
  get selected() {
    return this._selected;
  }
  set selected(isSelected) {
    this._selected = isSelected;
  }

  /**
   * Specifies whether the result action button is in loading state or not.
   * @api
   * @type {boolean}
   */
  @api
  get loading() {
    return this._loading;
  }
  set loading(isLoading) {
    this._loading = isLoading;
  }

  connectedCallback() {
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
   * Dispatches a custom event.
   */
  handleClick(event) {
    event.stopPropagation();
    const resultActionEvent = new CustomEvent(this.eventName, {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(resultActionEvent);
  }

  showTooltip() {
    this.tooltipComponent?.showTooltip();
  }

  hideTooltip() {
    this.tooltipComponent?.hideTooltip();
  }

  /**
   * @returns {Object}
   */
  get tooltipComponent() {
    return this.template.querySelector('c-quantic-tooltip');
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
