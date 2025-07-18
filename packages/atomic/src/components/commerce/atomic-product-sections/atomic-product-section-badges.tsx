import {hideEmptySection} from '@/src/utils/stencil-item-section-utils';
import {Element, Component} from '@stencil/core';

/**
 * @alpha
 *
 * This section is meant to render badges that highlight special features of the product.
 *
 * Behavior:
 * * Exposes the `--line-height` CSS variable so child elements can adjust to the current line height.
 * ** You should ensure that elements inside of it have `height: var(--line-height)`.
 * * Is a wrapping flexbox with a gap.
 * * May appear over, next to, or beneath the visual section.
 */
@Component({
  tag: 'atomic-product-section-badges',
  shadow: false,
})
export class AtomicProductSectionBadges {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
