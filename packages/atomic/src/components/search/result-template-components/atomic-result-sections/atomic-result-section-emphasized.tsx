import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * This section displays the field that's important for its search criteria.
 * For example, in Commerce, a product's cost is often more important than the title itself.
 *
 * Behavior:
 * * Has a very large font size.
 * * Is the second closest element beneath the title section.
 */
@Component({
  tag: 'atomic-result-section-emphasized',
  shadow: false,
})
export class AtomicResultSectionEmphasized {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
