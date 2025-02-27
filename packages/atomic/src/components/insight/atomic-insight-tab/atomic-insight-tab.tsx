import {Unsubscribe} from '@coveo/headless';
import {
  buildTab as buildInsightTab,
  Tab as InsightTab,
  TabState as InsightTabState,
} from '@coveo/headless/insight';
import {Component, h, Prop, State, Method, Element} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {Button} from '../../common/stencil-button';
import {dispatchTabLoaded, TabCommon} from '../../common/tabs/tab-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-tab',
  styleUrl: './atomic-insight-tab.pcss',
  shadow: true,
})
export class AtomicInsightTab
  implements TabCommon, InitializableComponent<InsightBindings>
{
  private tab!: InsightTab;
  private tabId = randomID('insight-tab');

  @Element() host!: HTMLElement;

  @InitializeBindings() public bindings!: InsightBindings;

  @State() public error!: Error;
  @State() private isAppLoaded = false;

  @BindStateToController('tab')
  @State()
  private tabState!: InsightTabState;

  /**
   * The label that will be shown to the user.
   */
  @Prop({reflect: true}) public label = 'no-label';

  /**
   * Whether this tab is active upon rendering.
   * If multiple tabs are set to active on render, the last one to be rendered will override the others.
   */
  @Prop({reflect: true, mutable: true}) public active = false;

  /**
   * The expression that will be passed to the search as a `cq` paramenter upon being selected.
   */
  @Prop() public expression!: string;

  private unsubscribe: Unsubscribe = () => {};

  /**
   * Activates the tab.
   */
  @Method()
  async select() {
    this.tab.select();
  }

  public initialize() {
    this.tab = buildInsightTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
      initialState: {isActive: this.active},
    });
    this.unsubscribe = this.tab.subscribe(
      () => (this.active = this.tab.state.isActive)
    );
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public componentDidRender() {
    dispatchTabLoaded(this.host);
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.isAppLoaded) {
      return;
    }

    return (
      <Button
        style="text-transparent"
        part="tab"
        class={this.tabState.isActive ? 'active' : ''}
        ariaLabel={this.bindings.i18n.t('tab-search', {label: this.label})}
        title={this.label}
        ariaPressed={`${this.tabState.isActive}`}
        onClick={() => this.tab.select()}
      >
        {this.label}
      </Button>
    );
  }
}
