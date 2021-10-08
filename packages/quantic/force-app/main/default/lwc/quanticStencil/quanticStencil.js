import {LightningElement, api} from 'lwc';

/**
 * The `QuanticStencil` component is used internally to display a deselectable button.
 * @example
 * <c-quantic-stencil variant="card"></c-quantic-stencil>
 */
export default class QuanticStencil extends LightningElement {
  /**
   * The type of stencil to display.
   * @api
   * @type {string}
   */
  @api variant;
}
