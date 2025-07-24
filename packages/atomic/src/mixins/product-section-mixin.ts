import type {LitElement} from 'lit';
import {hideEmptySection} from '@/src/utils/item-section-utils';
import type {Constructor} from './mixin-common';

/**
 * Mixin for product section components that provides common functionality.
 * All product section components extend LitElement and call hideEmptySection in updated().
 *
 * @param superClass - The base class to extend
 * @returns A class that extends the superClass with product section functionality
 */
export function ProductSectionMixin<T extends Constructor<LitElement>>(
  superClass: T
) {
  class ProductSectionMixinClass extends superClass {
    protected createRenderRoot() {
      return this;
    }

    protected updated() {
      hideEmptySection(this);
    }
  }

  return ProductSectionMixinClass as T;
}
