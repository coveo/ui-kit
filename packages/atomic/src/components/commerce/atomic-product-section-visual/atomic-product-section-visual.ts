import {css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/item-layout-utils';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

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
export class AtomicProductSectionVisual extends ItemSectionMixin(
  LitElement,
  css`
    @reference '../../common/template-system/sections/sections.css';
    atomic-product-section-visual {
      @apply section-visual;

      .with-sections {
        &.image-icon {
      atomic-product-image::part(previous-button),
      atomic-product-image::part(next-button),
      atomic-product-image::part(indicator) {
        display: none;
      }
    }}
    }
    `
) {
  /**
   * How large or small the visual section of product using this template should be.
   */
  @property({reflect: true, attribute: 'image-size', type: Object})
  public imageSize?: Omit<ItemDisplayImageSize, 'icon'>;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-visual': AtomicProductSectionVisual;
  }
}
