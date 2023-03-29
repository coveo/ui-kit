import {Component, Element, h} from '@stencil/core';
import {TabCommon} from '../../common/tabs/tabs-common';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tabs',
  styleUrl: './atomic-insight-tabs.pcss',
  shadow: true,
})
export class AtomicInsightTabs {
  @Element() host!: HTMLElement;

  private tabCommon!: TabCommon;

  public componentWillLoad() {
    this.tabCommon = new TabCommon({host: this.host});
  }

  public componentDidRender() {
    this.tabCommon.updateTabsDisplay();
  }

  public render() {
    return (
      <div class="flex">
        <slot></slot>
        {this.tabCommon.renderMoreButton()}
      </div>
    );
  }
}
