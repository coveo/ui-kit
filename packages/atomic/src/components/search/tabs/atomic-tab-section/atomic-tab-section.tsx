import {
  loadSearchActions,
  loadSearchAnalyticsActions,
  loadTabSetActions,
} from '@coveo/headless';
import {Component, h, Element, State, Listen, Prop} from '@stencil/core';
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
  @Prop()
  /**
   * When provided, this tab will be selected by default when the component loads. Otherwise, the first tab is selected automatically.
   */
  defaultActiveTab?: string;

  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  @Listen('atomic/tabClick')
  handleTabClick() {
    this.updateActiveTab();
  }

  componentDidRender() {
    const firstTab = this.host.querySelector('atomic-tab');

    if (firstTab && !getActiveTab(this.bindings.engine.state)?.tab) {
      this.bindings.engine.dispatch(
        loadTabSetActions(this.bindings.engine).updateActiveTab(
          this.defaultActiveTab ?? firstTab?.name
        )
      );
      // TODO: find a better way to handle this
      // This is a workaround to make sure the active tab is shown in the url when the page is loaded. However this causes an extra search request (that gets cancelled) on initial page load
      this.bindings.engine.dispatch(
        loadSearchActions(this.bindings.engine).executeSearch(
          loadSearchAnalyticsActions(this.bindings.engine).logInterfaceChange()
        )
      );
    }

    this.updateActiveTab();
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
