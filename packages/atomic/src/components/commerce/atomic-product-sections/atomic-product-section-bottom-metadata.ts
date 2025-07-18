import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {hideEmptySection} from '@/src/utils/item-section-utils';

/**
 * @alpha
 *
 * This section is meant to render additional descriptive information about the product.
 *
 * Behavior:
 * * Has a maximum height of two lines.
 * * Exposes the `--line-height` variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 * * Has a font weight.
 */
@customElement('atomic-product-section-bottom-metadata')
export class AtomicProductSectionBottomMetadata extends LitElement {
  public updated() {
    hideEmptySection(this);
  }

  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-bottom-metadata': AtomicProductSectionBottomMetadata;
  }
}
