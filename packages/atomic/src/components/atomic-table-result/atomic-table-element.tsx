import {Component, Prop} from '@stencil/core';

/**
 * The `atomic-table-element` element defines a table column in a result list.
 */
@Component({
  tag: 'atomic-table-element',
})
export class AtomicTableElement {
  /**
   * The label to display in the header of this column.
   */
  @Prop() public label!: string;
}
