import {Element, Component} from '@stencil/core';
import {containsVisualElement} from '../../../utils/utils';

/**
 * The badges section helps the information seekers understand at a glance
 * special features about the items.
 *
 * Behaviour:
 * * Has a fixed height that depends on the layout, the density and the screen size.
 *   * You should ensure that elements inside of it have `height: 100%`.
 * * May appear over, next to or underneath the visual section.
 * * May becomes scrollable horizontally on mobile.
 */
@Component({
  tag: 'atomic-result-section-badges',
  shadow: false,
})
export class AtomicResultSectionBadges {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    this.host.classList.toggle('empty', !containsVisualElement(this.host));
  }
}
