import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to display the field that's important for its search criteria.
 * For example, in Commerce, a product's price is often more important than the title itself.
 *
 * Behavior:
 * * Has a very large font size.
 * * Is the second closest element beneath the name section.
 *
 * @slot default - The emphasized field to display.
 */
@customElement('atomic-product-section-emphasized')
export class AtomicProductSectionEmphasized extends ItemSectionMixin(
  LitElement
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-emphasized': AtomicProductSectionEmphasized;
  }
}
