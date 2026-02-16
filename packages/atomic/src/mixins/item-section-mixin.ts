import type {CSSResultGroup, LitElement} from 'lit';
import {hideEmptySection} from '../utils/item-section-utils.js';
import {LightDomMixin} from './light-dom.js';
import type {Constructor} from './mixin-common.js';

/**
 * Mixin for item section components that provides common functionality.
 * All item section components extend LitElement and call hideEmptySection in updated().
 *
 * @param superClass - The base class to extend
 * @param styles - The styles to apply to the section.
 * @returns A class that extends the superClass with item section functionality
 */

export function ItemSectionMixin<T extends Constructor<LitElement>>(
  superClass: T,
  styles?: CSSResultGroup
) {
  class ItemSectionMixinClass extends LightDomMixin(superClass) {
    static styles = styles;

    protected updated() {
      hideEmptySection(this);
    }
  }

  return ItemSectionMixinClass as T;
}
