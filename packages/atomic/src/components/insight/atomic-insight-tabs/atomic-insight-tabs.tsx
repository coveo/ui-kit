import {Component, Element, h, State, Listen} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {TabsCommon} from '../../common/tabs/tabs-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tabs',
  styleUrl: './atomic-insight-tabs.pcss',
  shadow: true,
})
export class AtomicInsightTabs
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;

  @State() public error!: Error;

  @Element() host!: HTMLElement;

  private tabsCommon!: TabsCommon;

  public componentWillLoad() {
    this.tabsCommon = new TabsCommon({host: this.host});
  }

  public componentDidRender() {
    this.tabsCommon.updateTabsDisplay();
  }

  @Listen('atomic/tabRendered')
  public resolveResult(event: CustomEvent<{}>) {
    event.preventDefault();
    this.tabsCommon.updateTabsDisplay();
    this.render();
  }

  public render() {
    return (
      <div class="flex">
        <slot></slot>
        {this.tabsCommon.renderMoreButton(this.bindings)}
      </div>
    );
  }
}
