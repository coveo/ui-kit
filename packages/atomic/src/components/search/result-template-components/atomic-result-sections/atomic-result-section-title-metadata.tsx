import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * This section surfaces some fields that are directly related to the title of the item.
 * For example, in Commerce, this could be the item's rating, which is tied to the nature of the product itself,
 * rather than to the product's description.
 *
 * Behavior:
 * * Has a very small font size.
 * * Is the closest element beneath the title section.
 */
@Component({
  tag: 'atomic-result-section-title-metadata',
  shadow: false,
})
export class AtomicResultSectionTitleMetadata {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
