import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {hideEmptySection} from '@/src/utils/item-section-utils';

/**
 * @alpha
 *
 * This section is meant to render child products, available when using the <atomic-product-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 */
@customElement('atomic-product-section-children')
export class AtomicProductSectionChildren extends LitElement {
  protected updated() {
    hideEmptySection(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-children': AtomicProductSectionChildren;
  }
}
