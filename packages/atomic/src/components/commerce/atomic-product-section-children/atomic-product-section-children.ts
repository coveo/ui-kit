import {css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ItemSectionMixin} from '@/src/mixins/item-section-mixin';

/**
 * This section is meant to render child products, available when using the <atomic-product-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the product, indented and wrapped in a border.
 */
@customElement('atomic-product-section-children')
export class AtomicProductSectionChildren extends ItemSectionMixin(
  LitElement,
  css`
@reference '../../../utils/tailwind.global.tw.css';
@reference '../../common/template-system/sections/sections.css';
atomic-product-section-children {
  @apply section-children;
  &.with-sections {
    &.image-icon,
    &.image-none {
      .product-child {
        @apply size-8;
      }
    }
    &.display-grid {
      &.image-large,
      &.image-small {
        .product-child {
          @apply aspect-square-[auto];
          @apply w-1/6;
        }
      }
      @media not all and (width >= theme(--breakpoint-desktop)) {
        &.image-small .product-child {
          @apply max-w-19;
        }
      }
    }

    &.display-list {
      @media (width >= theme(--breakpoint-desktop)) {
        &.image-large.density-comfortable,
        &.image-large.density-normal {
          .product-child {
            @apply size-27;
          }
        }
        &.image-small,
        &.image-large.density-compact {
          .product-child {
            @apply size-8;
          }
        }
      }
      @media not all and (width >= theme(--breakpoint-desktop)) {
        &.image-large .product-child {
          @apply aspect-square-[auto] w-1/6;
        }
        &.image-small .product-child {
          @apply size-8;
        }
      }
    }
  }
}
`
) {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-section-children': AtomicProductSectionChildren;
  }
}
