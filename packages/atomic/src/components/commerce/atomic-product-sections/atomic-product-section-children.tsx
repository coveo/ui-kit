import {hideEmptySection} from '@/src/utils/stencil-item-section-utils';
import {Element, Component} from '@stencil/core';

/**
 * @alpha
 *
 * This section is meant to render child products, available when using the <atomic-product-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 */
@Component({
  tag: 'atomic-product-section-children',
  shadow: false,
})
export class AtomicProductSectionChildren {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
