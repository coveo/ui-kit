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
   * @type {'card'|'resultList'}
   */
  @api variant;
  /**
   * Number of rows to render.
   * @api
   * @type {number}
   */
  @api numberOfRows = 8;

  get rows() {
    const rows = [];
    for (let i = 0; i < this.numberOfRows; i++) {
      rows.push({index: i});
    }
    return rows;
  }

  get isCardVariant() {
    return this.variant === 'card';
  }

  get isResultListVariant() {
    return this.variant === 'resultList';
  }
}
