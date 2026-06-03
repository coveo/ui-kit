import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-table-element` element defines a table column in a result list.
 */
@customElement('atomic-table-element')
export class AtomicTableElement extends LightDomMixin(LitElement) {
  /**
   * The label to display in the header of this column.
   */
  @property({reflect: true}) label!: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-table-element': AtomicTableElement;
  }
}
