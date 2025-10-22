import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is meant to render badges that highlight special features of the product.
 *
 * Behavior:
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * ** You should ensure that elements inside of it have `height: var(--line-height)`.
 * * Is a wrapping flexbox with a gap.
 * * May appear over, next to, or beneath the visual section.
 *
 */
@customElement('atomic-product-section-badges')
export class AtomicProductSectionBadges extends ItemSectionMixin(
  LitElement,
  css`
      @reference '../../common/template-system/sections/sections.css';
      atomic-product-section-badges {
        @apply section-badges;
      }
      `
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-badges': AtomicProductSectionBadges;
  }
}
