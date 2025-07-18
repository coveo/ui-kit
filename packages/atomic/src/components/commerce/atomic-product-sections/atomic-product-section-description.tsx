import {hideEmptySection} from '@/src/utils/item-section-utils';
import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * @alpha
 *
 * This section is intended to render an informative summary of the product's description.
 *
 * Behavior:
 * * Has a fixed height of one to three lines, depending on the layout and density.
 * * Ellipses overflowing text.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@customElement('atomic-product-section-description')
export class AtomicProductSectionDescription extends LitElement {
  public updated() {
    hideEmptySection(this);
  }

  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-description': AtomicProductSectionDescription;
  }
}
