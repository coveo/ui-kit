import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/display-options';
import {ProductSectionMixin} from '@/src/mixins/product-section-mixin';

/**
 * This section is intended to provide visual information about the product.
 * In commerce, an image is a great shorthand for a product category.
 *
 * Behavior:
 * * Has a fixed size that depends on the specified image size, the layout, the density, and the screen size.
 * ** You should ensure that elements inside of it take the available space.
 * * Always has a 1:1 aspect ratio.
 */
@customElement('atomic-product-section-visual')
export class AtomicProductSectionVisual extends ProductSectionMixin(
  LitElement
) {
  /**
   * How large or small the visual section of product using this template should be.
   */
  @property({reflect: true, attribute: 'image-size'})
  public imageSize?: Omit<ItemDisplayImageSize, 'icon'>;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-visual': AtomicProductSectionVisual;
  }
}
