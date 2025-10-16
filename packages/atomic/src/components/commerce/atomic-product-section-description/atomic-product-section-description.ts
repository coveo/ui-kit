import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is intended to render an informative summary of the product's description.
 *
 * Behavior:
 * * Has a fixed height of one to three lines, depending on the layout and density.
 * * Ellipses overflowing text.
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 */
@customElement('atomic-product-section-description')
export class AtomicProductSectionDescription extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../common/template-system/sections/sections.css';
atomic-product-section-description {
  @apply section-excerpt;

  &.with-sections {
    &.display-grid {
      &.density-comfortable {
        margin-top: 1.25rem;
      }
      &.density-normal {
        margin-top: 0.75rem;
      }
      &.density-compact {
        margin-top: 0.25rem;
      }
    }
  }
}`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-description': AtomicProductSectionDescription;
  }
}
