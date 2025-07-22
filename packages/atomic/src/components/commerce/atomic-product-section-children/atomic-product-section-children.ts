import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ProductSectionMixin} from '@/src/mixins/product-section-mixin';

/**
 * @alpha
 *
 * This section is meant to render child products, available when using the <atomic-product-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 */
@customElement('atomic-product-section-children')
export class AtomicProductSectionChildren extends ProductSectionMixin(
  LitElement
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-children': AtomicProductSectionChildren;
  }
}
