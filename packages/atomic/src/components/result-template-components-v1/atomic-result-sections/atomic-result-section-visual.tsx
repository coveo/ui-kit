import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * This section provides visual information about the item.
 * For example, in Commerce, an image is a great shorthand for a product category.
 * An icon can quickly show the item type, or an avatar can quickly show the target customer.
 *
 * Behaviour:
 * * Has a fixed size that depends on the specified image size, the layout, the density, and the screen size.
 * ** When the image size is set to `icon`, this section stays very small.
 *   * You should ensure that elements inside of it take the available space.
 *   * You may use `atomic-size-condition` to display child elements if their parent meets the defined size constraints.
 * * Always has a 1:1 aspect ratio.
 * * Has rounded corners, hiding anything that overflows beyond them.
 * * Has a gray background when the image size is `small` or `large`.
 */
@Component({
  tag: 'atomic-result-section-visual',
  shadow: false,
})
export class AtomicResultSectionVisual {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
