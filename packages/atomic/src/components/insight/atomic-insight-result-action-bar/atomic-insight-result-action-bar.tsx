import {Component, Element} from '@stencil/core';
import {hideEmptySection} from '../../../utils/item-section-utils';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-result-action-bar',
  styleUrl: 'atomic-insight-result-action-bar.pcss',
})
export class AtomicInsightResultActionBar {
  @Element() private host!: HTMLElement;

  public componentDidRender() {
    hideEmptySection(this.host);
  }
}
