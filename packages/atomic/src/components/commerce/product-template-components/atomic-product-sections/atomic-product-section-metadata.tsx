import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * @alpha
 *
 * This section is intended to display some fields that are directly related to the name of the product.
 * In commerce, this could be the product rating, which is tied to the nature of the product itself,
 * rather than to the product's description.
 *
 * Behavior:
 * * Has a very small font size.
 * * Is the closest element beneath the title section.
 */
@Component({
  tag: 'atomic-product-section-metadata',
  shadow: false,
})
export class AtomicProductSectionMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
