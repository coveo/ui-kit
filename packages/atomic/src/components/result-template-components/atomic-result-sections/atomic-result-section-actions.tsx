import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The actions section allows the information seekers to quickly act on an item
 * without having to go into its details. Such example in commerce is adding an
 * item to the cart directly or adding it to a wish list to refer back to it
 * later.
 *
 * Behaviour:
 * * Has a fixed height that depends on the layout, the density and the screen size.
 *   * You should ensure that elements inside of it have `height: 100%`.
 * * May appear over the title section or under the bottom metadata section.
 * * May becomes scrollable horizontally on mobile.
 */
@Component({
  tag: 'atomic-result-section-actions',
  shadow: false,
})
export class AtomicResultSectionActions {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
