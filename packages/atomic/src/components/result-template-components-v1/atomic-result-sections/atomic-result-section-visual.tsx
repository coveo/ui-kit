import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The visual section helps the information seeker understand information about
 * the item visually, for example in Commerce an image is a great descriptive
 * for some category of products, an icon can help understand what type an item
 * is or an avatar understand whom it is related to.
 *
 * Behaviour:
 * * Has a fixed size that depends on the specified image size, the layout, the density, and screen size.
 *   * When the image size is set to icon, this section stays very small.
 *   * You should ensure that elements inside of it take the available space.
 *   * You may use `atomic-size-condition` to display elements conditionally to the available space.
 * * Always has a 1:1 aspect ratio.
 * * Has rounded corners, hiding anything that overflows out of them.
 * * Has a background color when the image size is `small` or `large`.
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
