import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is meant to render child products, available when using the <atomic-product-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 *
 * @slot default - The child products to display.
 */
@customElement('atomic-product-section-children')
export class AtomicProductSectionChildren extends ItemSectionMixin(
  LitElement
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-children': AtomicProductSectionChildren;
  }
}
