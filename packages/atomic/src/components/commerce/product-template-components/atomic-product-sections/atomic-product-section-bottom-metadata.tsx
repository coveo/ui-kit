import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * @alpha
 *
 * This section is meant to render additional descriptive information about the product.
 *
 * Behavior:
 * * Has a maximum height of two lines.
 * * Exposes the `--line-height` variable so child elements can adjust to the current line height.
 * * Has a defined CSS `color` property for text.
 * * Has a font weight.
 */
@Component({
  tag: 'atomic-product-section-bottom-metadata',
  shadow: false,
})
export class AtomicProductSectionBottomMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
