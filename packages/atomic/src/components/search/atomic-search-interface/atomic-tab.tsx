// atomic-tab.tsx
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
import {AtomicInsightStore} from '../../../components';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Button} from '../../common/button';
import {CommonBindings} from '../../common/interface/bindings';
import {dispatchTabLoaded} from '../../common/tabs/tab-common';

export interface Tab extends Controller {
  /**
   * Activates the tab.
   */
  select(): void;
  /**
   * The state of the `Tab` controller.
   */
  state: TabState;
}

export interface TabState {
  /**
   * Indicates whether the current tab is selected.
   * */
  isActive: boolean;
}

export type TabBindings = CommonBindings<
  SearchEngine,
  AtomicInsightStore,
  HTMLAtomicInsightInterfaceElement
>;

@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.pcss',
  shadow: true,
})
export class AtomicTab {
  @Prop()
  label!: string;
  @Prop()
  name!: string;
  @Prop()
  pipeline!: string;
  @Prop() isActive: boolean = false;

  @Event()
  tabClick!: EventEmitter;

  private tab!: Tab;
  private tabId = this.name;

  @Element() host!: HTMLElement;

  @InitializeBindings() public bindings!: TabBindings;

  @State() public error!: Error;

  @BindStateToController('tab')
  @State()
  private tabState!: TabState;

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @Prop({reflect: true, mutable: true}) public active = false;

  private unsubscribe: Unsubscribe = () => {};

  /**
   * Activates the tab.
   */
  @Method()
  async select() {
    this.tab.select();
  }

  /**
   * The expression that will be passed to the search as a `cq` paramenter upon being selected.
   */
  @Prop() public expression: string = '';

  public initialize() {
    this.tab = buildTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
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
    this.tabClick.emit(this.name);
    this.select();
  };

  public render() {
    return (
      <div>
        <Button
          style={this.tabState.isActive ? 'text-primary' : 'text-neutral'}
          class={`p-3 w-full text-xl ${this.tabState.isActive ? 'font-bold' : ''}`}
          text={this.label}
          part="button"
          onClick={() => this.handleClick()}
        ></Button>
      </div>
    );
  }
}
