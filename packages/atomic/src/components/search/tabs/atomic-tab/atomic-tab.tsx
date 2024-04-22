import {
  SearchEngine,
  Tab,
  TabState,
  Unsubscribe,
  buildTab,
} from '@coveo/headless';
import {Component, Prop, h, Element, Method, State} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {CommonBindings} from '../../../common/interface/bindings';
import {dispatchTabLoaded} from '../../../common/tabs/tab-common';
import {AtomicStore} from '../../atomic-search-interface/store';

type TabBindings = CommonBindings<
  SearchEngine,
  AtomicStore,
  HTMLAtomicSearchInterfaceElement
>;

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.pcss',
  shadow: true,
})
export class AtomicTab {
  @InitializeBindings() public bindings!: TabBindings;
  @Element() host!: HTMLElement;

  @State() public error!: Error;
  @BindStateToController('tab')
  @State()
  private tabState!: TabState;

  /**
   * Whether to make this tab the active one upon rendering.
   * If this prop is set to `true` on multiple tabs, the last tab to render will be the active one.
   */
  @Prop({reflect: true, mutable: true}) public active = false;
  /**
   * The label to display on the tab.
   */
  @Prop() label!: string;
  /**
   * The internal name of the atomic tab.
   */
  @Prop() name!: string;
  /**
   * Whether the tab is the active one.
   */
  @Prop({reflect: true}) isActive: boolean = false;
  /**
   * The [constant query expression (`cq`)](https://docs.coveo.com/en/2830/searching-with-coveo/about-the-query-expression#constant-query-expression-cq) to apply when the tab is the active one.
   */
  @Prop() public expression: string = '';

  private tab!: Tab;
  private unsubscribe: Unsubscribe = () => {};

  /**
   * Makes the tab the active one.
   */
  @Method()
  async select(triggerSearch: boolean = true) {
    if (!this.tab.state.isActive) {
      this.tab.select(triggerSearch);
    }
  }
  public initialize() {
    const clearStateOnTabChange =
      this.host.parentElement?.getAttribute('clear-state-on-tab-change') ===
      'true';

    this.tab = buildTab(this.bindings.engine, {
      options: {
        expression: this.expression,
        id: this.name,
        clearStateOnTabChange: clearStateOnTabChange,
      },
      initialState: {isActive: this.active},
    });

    this.unsubscribe = this.tab.subscribe(
      () => (this.active = this.tab.state.isActive)
    );
  }

  public componentDidRender() {
    dispatchTabLoaded(this.host);
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public handleClick = () => {
    this.select();
  };

  public render() {
    const {isActive} = this.tabState;
    const activeTabClass = isActive ? 'active-tab' : '';
    const activeTabTextClass = isActive ? '' : 'text-neutral-dark';

    return (
      <div class={activeTabClass}>
        <Button
          style="text-transparent"
          class={`px-6 pb-1 w-full text-xl ${activeTabTextClass}`}
          text={this.label}
          part="button"
          onClick={this.handleClick}
        ></Button>
      </div>
    );
  }
}
