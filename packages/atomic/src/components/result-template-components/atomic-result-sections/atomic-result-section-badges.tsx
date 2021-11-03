import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../utils/result-section-utils';

/**
 * This section provides badges that highlight special features of the item.
 *
 * Behavior:
 * * Has a fixed height that depends on the layout, the density, and the screen size.
 * ** You should ensure that elements inside of it have `height: 100%`.
 * * May appear over, next to, or beneath the visual section.
 * * May become horizontally scrollable on mobile.
 */
@Component({
  tag: 'atomic-result-section-badges',
  shadow: false,
})
export class AtomicResultSectionBadges {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
