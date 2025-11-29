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
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-tab-manager` component manages a collection of tabs,
 * allowing users to switch between them. Each child `atomic-tab` represents an
 * individual tab within the manager.
 *
 * @part button-container - The container for the tab button.
 * @part button-container-active - The container for the active tab button.
 * @part tab-button - The tab button.
 * @part tab-button-active - The container for the active tab button.
 * @part dropdown-area - The dropdown area.
 * @part tab-area - The tab area.
 * @part popover-button - The "More" button shown when the tabs are collapsed.
 * @part value-label - The label shown on the "More" button.
 * @part arrow-icon - The down chevron icon shown on the "More" button.
 * @part overflow-tabs - The list of tabs shown when the "More" button is clicked.
 * @part popover-tab - The individual tab buttons shown when the "More" button is clicked.
 * @part backdrop - The backdrop shown when the "More" button is clicked.
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

    tabElements.forEach((tabElement) => {
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
      <Host>
        <atomic-tab-bar>
          <div
            role="tablist"
            aria-label="tab-area"
            part="tab-area"
            class="border-neutral mb-2 flex w-full flex-row border-b"
          >
            {this.tabs.map((tab) => (
              <atomic-tab-button
                active={this.tabManagerState.activeTab === tab.name}
                label={this.bindings.i18n.t(tab.label, {
                  defaultValue: tab.label,
                })}
                select={() => {
                  if (!tab.tabController.state.isActive) {
                    tab.tabController.select();
                  }
                }}
              ></atomic-tab-button>
            ))}
          </div>
        </atomic-tab-bar>
      </Host>
    );
  }
}
