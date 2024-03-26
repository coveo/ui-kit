// atomic-tab-section.tsx
import {Component, h, Element, State, Listen} from '@stencil/core';

@Component({
  tag: 'atomic-tab-section',
  styleUrl: 'atomic-tab-section.pcss',
  shadow: true,
})
export class AtomicTabSection {
  @Element()
  host!: HTMLElement;
  @State() activeTab: string | undefined;

  @Listen('tabClick')
  handleTabClick(event: CustomEvent) {
    this.activeTab = event.detail;
    this.updateActiveTab();
  }

  componentDidRender() {
    if (!this.activeTab) {
      const firstTab = this.host.querySelector('atomic-tab');
      if (firstTab && firstTab.name) {
        this.activeTab = firstTab.name;
        this.updateActiveTab();
      }
    }
  }

  updateActiveTab() {
    const tabs = Array.from(this.host.querySelectorAll('atomic-tab'));
    tabs.forEach((tab) => {
      tab.isActive = tab.name === this.activeTab;
    });
  }

  render() {
    return (
      <div class="flex flex-row gap-2 mb-2">
        <slot></slot>
      </div>
    );
  }
}
