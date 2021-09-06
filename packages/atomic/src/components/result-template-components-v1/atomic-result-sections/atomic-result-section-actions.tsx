import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * This section allows the information seeker to perform an action on an item without having to view its details.
 * For example, in Commerce you can add an item to the cart directly or add it to a wish list to view at a later time.
 *
 * Behaviour:
 * * Has a fixed height that depends on the layout, the density, and the screen size.
 * ** You should ensure that elements inside of it have `height: 100%`.
 * * May appear over, next to, or beneath the visual section.
 * * May become horizontally scrollable on mobile.
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
