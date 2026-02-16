import {css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {ItemDisplayImageSize} from '@/src/components/common/layout/item-layout-utils';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to provide visual information about the result.
 * In commerce, an image is a great shorthand for a product category.
 * An icon can quickly show the result type, or an avatar can help identify to whom it is related.
 *
 * Behavior:
 * * Has a fixed size that depends on the specified image size, the layout, the density, and the screen size.
 * ** You should ensure that elements inside of it take the available space.
 * * Always has a 1:1 aspect ratio.
 */
@customElement('atomic-result-section-visual')
export class AtomicResultSectionVisual extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-result-section-visual {
  @apply section-visual;
}`
) {
  /**
   * How large or small the visual section of result using this template should be.
   */
  @property({reflect: true, attribute: 'image-size', type: Object})
  public imageSize?: Omit<ItemDisplayImageSize, 'icon'>;
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-section-visual': AtomicResultSectionVisual;
  }
}
