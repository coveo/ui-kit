import {Element, Component} from '@stencil/core';
import {hideEmptySection} from '../../../../utils/item-section-utils';

/**
 * This section displays the folded results, available when using the <atomic-result-children> component.
 *
 * Behavior:
 * * Shows children at the bottom of the result, indented and wrapped in a border.
 */
@Component({
  tag: 'atomic-result-section-children',
  shadow: false,
})
export class AtomicResultSectionChildren {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
