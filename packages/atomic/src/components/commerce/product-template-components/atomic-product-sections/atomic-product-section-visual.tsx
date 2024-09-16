import {Element, Component, Prop} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';
import {ItemDisplayImageSize} from '../../../common/layout/display-options';

/**
 * @alpha
 *
 * This section is intended to provide visual information about the product.
 * In commerce, an image is a great shorthand for a product category.
 *
 * Behavior:
 * * Has a fixed size that depends on the specified image size, the layout, the density, and the screen size.
 * ** You should ensure that elements inside of it take the available space.
 * * Always has a 1:1 aspect ratio.
 */
@Component({
  tag: 'atomic-product-section-visual',
  shadow: false,
})
export class AtomicProductSectionVisual {
  @Element() private host!: HTMLElement;

  /**
   * How large or small the visual section of product using this template should be.
   */
  @Prop({reflect: true}) public imageSize?: Omit<ItemDisplayImageSize, 'icon'>;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
