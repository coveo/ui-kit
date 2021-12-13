import {LightningElement, api} from 'lwc';

/**
 * The `QuanticPlaceholder` component is used internally to display a loading placeholder for certain components.
 * @category Utility
 * @example
 * <c-quantic-placeholder variant="card"></c-quantic-placeholder>
 */
export default class quanticPlaceholder extends LightningElement {
  /**
   * The type of placeholder to display.
   * @api
   * @type {'card'|'resultList'}
   */
  @api variant;
  /**
   * Number of rows to display inside the placeholder.
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
