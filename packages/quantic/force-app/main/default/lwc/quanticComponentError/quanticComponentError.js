import { LightningElement, api } from 'lwc';

/**
 * The `QuanticComponentError` is used by the other Quantic components to display component errors.
 * @category Internal
 * @example
 * <c-quantic-component-error component-name={name}></c-quantic-component-error>
 */
export default class QuanticComponentError extends LightningElement {
  @api componentName;
}