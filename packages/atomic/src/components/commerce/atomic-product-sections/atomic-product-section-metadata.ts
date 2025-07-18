import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {hideEmptySection} from '@/src/utils/item-section-utils';

/**
 * @alpha
 *
 * This section is intended to display some fields that are directly related to the name of the product.
 * In commerce, this could be the product rating, which is tied to the nature of the product itself,
 * rather than to the product's description.
 *
 * Behavior:
 * * Has a very small font size.
 * * Is the closest element beneath the title section.
 */
@customElement('atomic-product-section-metadata')
export class AtomicProductSectionMetadata extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  protected updated() {
    hideEmptySection(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-metadata': AtomicProductSectionMetadata;
  }
}
