import {TabManager, TabManagerState, buildTabManager} from '@coveo/headless';
import {Component, h, Element, State, Prop} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {getActiveTab} from '../../../../utils/tab-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab-manager',
  styleUrl: 'atomic-tab-manager.pcss',
  shadow: true,
})
export class AtomicTabManager {
  @InitializeBindings() public bindings!: Bindings;
  @BindStateToController('tabManager')
  @State()
  private tabManagerState!: TabManagerState;
  @Element()
  private host!: HTMLElement;
  public tabManager!: TabManager;

  /**
   * Whether to clear the state when the active tab changes.
   */
  @Prop() clearStateOnTabChange?: boolean = false;

  @State() public error!: Error;
  @State() tabs: HTMLAtomicTabElement[] = [];

  componentDidLoad() {
    this.setInitialTab();
  }

  componentWillUpdate() {
    const tabs = [...this.host.querySelectorAll('atomic-tab')];
    this.tabs = tabs;

    if (tabs.length === 0) {
      this.error = new Error(
        'The "atomic-tab-manager" element requires at least one "atomic-tab" child.'
      );
      return;
    }
  }

  async setInitialTab() {
    const initialTab = this.tabs[0];
    const activeTab = getActiveTab(this.bindings.engine.state)?.tab;

    if (initialTab && !activeTab) {
      await initialTab.select(false);
    }
  }

  public initialize() {
    this.tabManager = buildTabManager(this.bindings.engine);
  }

  public render() {
    return (
      <div class="mb-2 overflow-x-auto">
        <div class="flex flex-row w-full mb-2 border-b tabs-area">
          <slot></slot>
        </div>
        <div class="hidden pb-1 border-b dropdown-area">
          <select
            class="py-2 text-xl font-bold cursor-pointer btn-text-primary"
            onChange={(e) => {
              const selectedTab = this.tabs.find(
                (tab) => tab.name === (e.target as HTMLSelectElement).value
              );
              if (selectedTab) {
                selectedTab.select();
              }
            }}
          >
            {this.tabs.map((tab) => (
              <option
                value={tab.name}
                selected={tab.name === this.tabManagerState.activeTab}
              >
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
