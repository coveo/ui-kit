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
  Event,
  EventEmitter,
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
  componentDidRender() {
    const firstTab = this.host.querySelector('atomic-tab');
    const tabs = [...this.host.querySelectorAll('atomic-tab')];

    this.buildDropdown(tabs);

    if (firstTab && !getActiveTab(this.bindings.engine.state)?.tab) {
      this.bindings.engine.dispatch(
        loadTabSetActions(this.bindings.engine).updateActiveTab(
          this.defaultActiveTab ?? firstTab?.name
        )
      );
      this.tabInit.emit();
    }
  }

  buildDropdown(tabs: HTMLAtomicTabElement[]) {
    tabs.slice(3).forEach((tab) => {
      tab.isHidden = true;

      const dropdownOptionLi = document.createElement('li');
      const dropdownOptionButton = document.createElement('button');

      dropdownOptionButton.className = 'btn-text-transparent text-left';
      dropdownOptionButton.innerText = tab.label;
      dropdownOptionButton.name = tab.name;
      dropdownOptionButton.onclick = () => {
        tab.select();
        setTimeout(() => {
          const buttonInTab = tab.shadowRoot?.querySelector('button');
          buttonInTab?.focus();
        }, 0);
      };

      dropdownOptionLi.appendChild(dropdownOptionButton);

      this.host.shadowRoot
        ?.querySelector('.dropdown-content')
        ?.appendChild(dropdownOptionLi);
    });
  }

  updateActiveTab() {
    const tabs = Array.from(this.host.querySelectorAll('atomic-tab'));
    const dropdownContentArea =
      this.host.shadowRoot?.querySelector('.dropdown-content');
    const dropdownButtons = Array.from(
      dropdownContentArea?.querySelectorAll('button') || []
    );

    tabs.forEach((tab) => {
      tab.isActive = tab.name === getActiveTab(this.bindings.engine.state)?.tab;
    });

    tabs.slice(3).forEach((tab) => {
      const buttonExists = dropdownButtons.some(
        (button) => button.name === tab.name
      );
      tab.isHidden = !tab.isActive && buttonExists;
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
      <div class="overflow-visible">
        <div class="my-4 flex flex-row mb-2 border-b">
          <slot></slot>
          <div class="group dropdown-area relative cursor-pointer ">
            <Button
              tabIndex="0"
              style="text-transparent"
              class={
                'px-6 pb-1 w-full text-xl text-neutral-dark group-focus-within:text-primary group-hover:text-primary-light'
              }
              text="More"
              part="button"
            >
              {' '}
              <atomic-icon
                icon={ArrowDown}
                class="w-3 ml-2 align-baseline"
              ></atomic-icon>
            </Button>
            <ul class="absolute gap-2 flex group-focus-within:visible focus:visible group-hover:visible invisible dropdown-content absolute top-0 mt-6 flex-col rounded-md shadow-lg bg-white z-50 p-4"></ul>
          </div>
        </div>
      </div>
    );
  }
}
