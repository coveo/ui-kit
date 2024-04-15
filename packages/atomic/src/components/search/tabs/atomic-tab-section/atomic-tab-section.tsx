import {Component, h, Element, State, Listen} from '@stencil/core';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {getActiveTab} from '../../../../utils/tab-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

@Component({
  tag: 'atomic-tab-section',
  styleUrl: 'atomic-tab-section.pcss',
  shadow: true,
})
export class AtomicTabSection {
  @Element()
  private host!: HTMLElement;

  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  @Listen('atomic/tabClick')
  handleTabClick() {
    this.updateActiveTab();
  }

  componentDidRender() {
    const firstTab = this.host.querySelector('atomic-tab');
    if (firstTab && firstTab.name) {
      this.updateActiveTab();
    }
  }

  updateActiveTab() {
    const tabs = Array.from(this.host.querySelectorAll('atomic-tab'));
    tabs.forEach((tab) => {
      tab.isActive = tab.name === getActiveTab(this.bindings.engine.state)?.tab;
    });
  }

  public render() {
    return (
      <div class="overflow-x-scroll">
        <div class="my-4 flex flex-row gap-2 mb-2 border-b">
          <slot></slot>
        </div>
      </div>
    );
  }
}
