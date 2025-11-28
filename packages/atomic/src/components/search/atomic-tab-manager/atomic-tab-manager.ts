import {
  buildTab,
  buildTabManager,
  type Tab,
  type TabManager,
  type TabManagerState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

interface TabInfo {
  label: string;
  name: string;
  tabController: Tab;
}

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
 * @slot (default) - The `atomic-tab` elements that represent the tabs.
 */
@customElement('atomic-tab-manager')
@bindings()
@withTailwindStyles
export class AtomicTabManager
  extends LitElement
  implements InitializableComponent<Bindings>
{
  static styles: CSSResultGroup = css`
    atomic-tab-bar::part(popover-button) {
      margin: 0;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      padding-bottom: 0.25rem;
      text-align: left;
      font-size: 1.25rem;
      line-height: 1.75rem;
      font-weight: 400;
      color: black;
    }

    @media (min-width: 640px) {
      atomic-tab-bar::part(popover-button) {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    atomic-tab-bar::part(value-label) {
      font-weight: 400;
    }

    ::part(popover-tab) {
      font-weight: 400;
    }
  `;

  public bindings!: Bindings;
  public tabManager!: TabManager;

  @bindStateToController('tabManager')
  @state()
  private tabManagerState!: TabManagerState;

  @state() public error!: Error;

  private tabs: TabInfo[] = [];

  /**
   * Whether to clear the filters when the active tab changes.
   */
  @property({type: Boolean, attribute: 'clear-filters-on-tab-change'})
  clearFiltersOnTabChange = false;

  public initialize() {
    this.tabManager = buildTabManager(this.bindings.engine);

    const tabElements = Array.from(this.querySelectorAll('atomic-tab'));

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

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      <atomic-tab-bar>
        <div
          role="list"
          aria-label="tab-area"
          part="tab-area"
          class="border-neutral mb-2 flex w-full flex-row border-b"
        >
          ${this.tabs.map((tab) => {
            const isActive = this.tabManagerState.activeTab === tab.name;
            return html`
              <atomic-tab-button
                .active=${isActive}
                .label=${this.bindings.i18n.t(tab.label, {
                  defaultValue: tab.label,
                })}
                .select=${() => {
                  if (!tab.tabController.state.isActive) {
                    tab.tabController.select();
                  }
                }}
              ></atomic-tab-button>
            `;
          })}
        </div>
      </atomic-tab-bar>
    `;
  }
}
