import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * @alpha
 *
 * This section is intended to display the field that's important for its search criteria.
 * For example, in Commerce, a product's price is often more important than the title itself.
 *
 * Behavior:
 * * Has a very large font size.
 * * Is the second closest element beneath the name section.
 */
@Component({
  tag: 'atomic-product-section-emphasized',
  shadow: false,
})
export class AtomicProductSectionEmphasized {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
