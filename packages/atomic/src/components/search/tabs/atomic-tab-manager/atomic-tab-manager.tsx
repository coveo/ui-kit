import {
  TabManager,
  TabManagerState,
  buildTabManager,
  Tab,
  buildTab,
} from '@coveo/headless';
import {Component, h, Element, State, Prop, Host} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {TabDropdown} from '../../../common/tab-manager/tab-dropdown';
import {TabDropdownOption} from '../../../common/tab-manager/tab-dropdown-option';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @alpha
 *
 * @part button-container - The container for the tab button.
 * @part button - The tab button.
 * @part dropdown-area - The dropdown area.
 * @part tab-area - The tab area.
 * @slot default
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

  private tabs: {label: string; name: string; tabController: Tab}[] = [];

  /**
   * Whether to clear the filters when the active tab changes.
   */
  @Prop() clearFiltersOnTabChange?: boolean = false;

  @State() public error!: Error;

  public initialize() {
    this.tabManager = buildTabManager(this.bindings.engine);

    const tabElements = Array.from(this.host.querySelectorAll('atomic-tab'));

    if (tabElements.length === 0) {
      this.error = new Error(
        'The "atomic-tab-manager" element requires at least one "atomic-tab" child.'
      );
      return;
    }

    tabElements.forEach((tabElement, index) => {
      if (!tabElement.name) {
        this.error = new Error(
          'The "name" attribute must be defined on all "atomic-tab" children.'
        );
        return;
      }
      const tabController = buildTab(this.bindings.engine, {
        options: {
          expression: tabElement.expression,
          id: tabElement.name,
          clearFiltersOnTabChange: this.clearFiltersOnTabChange,
        },
        initialState: {isActive: index === 0 ? true : false},
      });

      this.tabs.push({
        label: tabElement.label,
        name: tabElement.name,
        tabController,
      });
    });
  }

  render() {
    return (
      <Host class="mb-2">
        <tab-manager-bar>
          <div
            role="list"
            aria-label="tab-area"
            part="tab-area"
            class="mb-2 flex hidden w-full flex-row border-b sm:flex"
          >
            {this.tabs.map((tab) => (
              <Tab-Manager-Button
                active={this.tabManagerState.activeTab === tab.name}
                label={tab.label}
                select={() => {
                  if (!tab.tabController.state.isActive) {
                    tab.tabController.select();
                  }
                }}
              ></Tab-Manager-Button>
            ))}
          </div>
          <div class="w-full sm:hidden">
            <TabDropdown
              tabs={this.tabs}
              activeTab={this.tabManagerState.activeTab}
              onTabChange={(e) => {
                const selectedTab = this.tabs.find(
                  (tab) => tab.name === (e as string)
                );
                if (selectedTab) {
                  selectedTab.tabController.select();
                }
              }}
            >
              {this.tabs.map((tab) => (
                <TabDropdownOption
                  value={tab.name}
                  label={tab.label}
                  isSelected={tab.name === this.tabManagerState.activeTab}
                />
              ))}
            </TabDropdown>
          </div>
        </tab-manager-bar>
      </Host>
    );
  }
}
