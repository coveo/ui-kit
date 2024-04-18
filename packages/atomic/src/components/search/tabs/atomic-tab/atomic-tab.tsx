import {Controller, SearchEngine, Unsubscribe, buildTab} from '@coveo/headless';
import {
  Component,
  Prop,
  h,
  Event,
  EventEmitter,
  Element,
  Method,
  State,
} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {Button} from '../../../common/button';
import {CommonBindings} from '../../../common/interface/bindings';
import {dispatchTabLoaded} from '../../../common/tabs/tab-common';
import {AtomicStore} from '../../atomic-search-interface/store';

interface Tab extends Controller {
  /**
   * Activates the tab.
   */
  select(): void;
  /**
   * The state of the `Tab` controller.
   */
  state: TabState;
}

interface TabState {
  /**
   * Indicates whether the current tab is selected.
   * */
  isActive: boolean;
}

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

  @Event({
    eventName: 'atomic/tabClick',
  })
  tabClick!: EventEmitter;

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @Prop({reflect: true, mutable: true}) public active = false;
  /**
   * The label displayed on the tab.
   */
  @Prop() label!: string;
  /**
   * The internal name of the atomic tab.
   */
  @Prop() name!: string;
  /**
   * Indicates whether the tab is currently active.
   */
  @Prop({reflect: true}) isActive: boolean = false;
  /**
   * The expression that will be passed to the search as a `cq` paramenter upon being selected.
   */
  @Prop() public expression: string = '';

  private tab!: Tab;
  private unsubscribe: Unsubscribe = () => {};

  /**
   * Activates the tab.
   */
  @Method()
  async select() {
    if (!this.tab.state.isActive) {
      this.tab.select();
      this.tabClick.emit();
    }
  }

  public initialize() {
    this.tab = buildTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.name},
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
