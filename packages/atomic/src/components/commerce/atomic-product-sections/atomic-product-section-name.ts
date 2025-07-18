import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {hideEmptySection} from '@/src/utils/item-section-utils';

/**
 * @alpha
 *
 * This section is intended to display the product's name, and its main use is to make the product list scannable.
 *
 * Behavior:
 * * Has a fixed height of two lines on grid layouts.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@customElement('atomic-product-section-name')
export class AtomicProductSectionName extends LitElement {
  createRenderRoot() {
    return this;
  }

  updated() {
    hideEmptySection(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-name': AtomicProductSectionName;
  }
}
