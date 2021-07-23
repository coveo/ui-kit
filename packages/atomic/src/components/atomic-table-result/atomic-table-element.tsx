import {Component, Prop} from '@stencil/core';

/**
 * The `atomic-table-element` element defines a table column.
 */
@Component({
  tag: 'atomic-table-element',
})
export class AtomicTableElement {
  @Prop() public label!: string;
}
