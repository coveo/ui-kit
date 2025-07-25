import {hideEmptySection} from '@/src/utils/item-section-utils';
import {Element, Component} from '@stencil/core';

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
@Component({
  tag: 'atomic-product-section-name',
  shadow: false,
})
export class AtomicProductSectionName {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
