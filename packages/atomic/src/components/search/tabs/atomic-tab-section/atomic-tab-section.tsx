import {
  loadBreadcrumbActions,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  loadTabSetActions,
} from '@coveo/headless';
import {
  Component,
  h,
  Element,
  State,
  Listen,
  Prop,
  EventEmitter,
  Event,
} from '@stencil/core';
import ArrowDown from '../../../../images/arrow-down.svg';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {getActiveTab} from '../../../../utils/tab-utils';
import {Button} from '../../../common/button';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab-section',
  styleUrl: 'atomic-tab-section.pcss',
  shadow: true,
})
export class AtomicTabSection {
  @InitializeBindings() public bindings!: Bindings;
  @Element()
  private host!: HTMLElement;

  /**
   * When provided, this tab will be selected by default when the component loads. Otherwise, the first tab is selected automatically.
   */
  @Prop() defaultActiveTab?: string;
  /**
   * Specifies whether the state should be cleared when the tab changes.
   */
  @Prop() clearStateOnTabChange?: boolean = false;

  @State() public error!: Error;
  @State() tabs: HTMLAtomicTabElement[] = [];

  @Event({
    eventName: 'atomic/tabInit',
  })
  tabInit!: EventEmitter;

  @Listen('atomic/tabClick')
  handleTabClick() {
    this.updateActiveTab();
    if (this.clearStateOnTabChange) {
      this.clearState();
    }
  }

  componentDidLoad() {
    this.setInitialTab();
  }

  componentWillUpdate() {
    const tabs = [...this.host.querySelectorAll('atomic-tab')];
    this.tabs = tabs;

    if (tabs.length === 0) {
      this.error = new Error(
        'The "atomic-tab-section" element requires at least one "atomic-tab" child.'
      );
      return;
    }
  }

  setInitialTab() {
    const initialTab =
      this.tabs.find((tab) => tab.name === this.defaultActiveTab) ||
      this.tabs[0];
    const activeTab = getActiveTab(this.bindings.engine.state)?.tab;

    if (initialTab && !activeTab) {
      this.bindings.engine.dispatch(
        loadTabSetActions(this.bindings.engine).updateActiveTab(initialTab.name)
      );
      this.tabInit.emit();
    }
    this.updateActiveTab();
  }

  buildDropdown() {
    return this.tabs.map((tab) => (
      <li>
        <Button
          style="text-transparent"
          title={tab.name}
          class="w-full px-6 pb-1 text-xl text-neutral-dark dropdown-option"
          text={tab.label}
          onClick={() => {
            tab.select();
          }}
        />
      </li>
    ));
  }

  updateActiveTab() {
    const dropdownButton =
      this.host.shadowRoot?.querySelector('.dropdown-button');
    const dropdownOptions = [
      ...(this.host.shadowRoot?.querySelectorAll('.dropdown-option') || []),
    ];
    const activeTabName = getActiveTab(this.bindings.engine.state)?.tab;

    this.tabs.forEach((tab) => {
      tab.isActive = tab.name === activeTabName;

      if (tab.isActive) {
        const span = dropdownButton?.getElementsByTagName('span')[0];
        if (span) {
          span.textContent = tab.label;
        }
      }
    });

    dropdownOptions.forEach((option) => {
      if ((option as HTMLButtonElement).title === activeTabName) {
        option.classList.add('font-bold');
      } else {
        option.classList.remove('font-bold');
      }
    });
  }

  clearState() {
    const breadcrumbActions = loadBreadcrumbActions(this.bindings.engine);
    const queryActions = loadQueryActions(this.bindings.engine);
    const searchActions = loadSearchActions(this.bindings.engine);
    const searchAnalyticsActions = loadSearchAnalyticsActions(
      this.bindings.engine
    );

    this.bindings.engine.dispatch(breadcrumbActions.deselectAllBreadcrumbs());
    this.bindings.engine.dispatch(
      breadcrumbActions.deselectAllNonBreadcrumbs()
    );
    this.bindings.engine.dispatch(queryActions.updateQuery({q: ''}));
    this.bindings.engine.dispatch(
      searchActions.executeSearch(searchAnalyticsActions.logInterfaceChange())
    );
  }

  public render() {
    return (
      <div class="mb-4 overflow-visible ">
        <div class="flex flex-row tabs-container">
          <div class="flex flex-row w-full mb-2 border-b tabs-area ">
            <slot></slot>
          </div>
          <div class="relative flex-row hidden mb-2 border-b cursor-pointer group dropdown-area ">
            <Button
              tabIndex="0"
              style="text-transparent"
              class={
                'px-6 pb-1 text-xl group-focus-within:text-primary group-hover:text-primary-light dropdown-button'
              }
              text="Tabs"
              part="button"
            >
              <atomic-icon
                icon={ArrowDown}
                class="w-3 ml-2 align-baseline"
              ></atomic-icon>
            </Button>
            <ul class="absolute top-0 z-50 flex flex-col invisible gap-2 p-4 mt-6 bg-white rounded-md shadow-lg focus:visible group-focus-within:visible group:visible dropdown-content">
              {this.buildDropdown()}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
