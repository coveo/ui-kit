import componentError from '@salesforce/label/c.quantic_ComponentError';
import LookAtDeveloperConsole from '@salesforce/label/c.quantic_LookAtDeveloperConsole';
import {I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticComponentError` is used by the other Quantic components to display component error messages.
 * @category Internal
 * @example
 * <c-quantic-component-error component-name={name}></c-quantic-component-error>
 */
export default class QuanticComponentError extends LightningElement {
  labels = {
    componentError,
    LookAtDeveloperConsole,
  };

  /**
   * The name of the component.
   * @api
   * @type {string}
   */
  @api componentName;
  /**
   * The error message to display.
   * @api
   * @type {string}
   * @defaultValue `'Look at the developer console for more information.'`
   */
  @api message = this.labels.LookAtDeveloperConsole;

  get errorTitle() {
    return `${I18nUtils.format(
      this.labels.componentError,
      this.componentName
    )}`;
  }

  get errorMessage() {
    return this.message;
  }
}
