import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * This section allows the information seeker to perform an action on an item without having to view its details.
 * For example, in Commerce you can add an item to the cart directly or add it to a wish list to view at a later time.
 *
 * Behavior:
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * ** You should ensure that elements inside of it have `height: var(--line-height)`.
 * * Is a wrapping flexbox with a gap.
 * * May appear over, next to, or beneath the visual section.
 */
@Component({
  tag: 'atomic-result-section-actions',
  shadow: false,
})
export class AtomicResultSectionActions {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
