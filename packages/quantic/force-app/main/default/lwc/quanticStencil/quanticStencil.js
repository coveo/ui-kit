import {LightningElement, api} from 'lwc';

/**
 * The `QuanticStencil` component is used internally to display a loading stncil for certain components.
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
  @api numberOfRows;

  get shouldDisplay() {
    return !!this.variant && !!this.numberOfRows;
  }

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
