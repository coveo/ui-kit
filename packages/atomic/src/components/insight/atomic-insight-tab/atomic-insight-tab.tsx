import {Unsubscribe} from '@coveo/headless';
import {Component, h, Prop, State, Method, Element} from '@stencil/core';
import {buildInsightTab, InsightTab, InsightTabState} from '..';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {Button} from '../../common/button';
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
  }

  public componentDidRender() {
    dispatchTabLoaded(this.host);
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  public render() {
    if (!this.bindings.store.isAppLoaded()) {
      return;
    }

    const buttonClasses = ['relative', 'pb-3', 'mt-1', 'mr-6', 'font-semibold'];
    if (this.tabState.isActive) {
      buttonClasses.push('active');
    }

    return (
      <Button
        style="text-transparent"
        part="tab"
        class={buttonClasses.join(' ')}
        ariaLabel={this.bindings.i18n.t('tab-search', {label: this.label})}
        ariaPressed={`${this.tabState.isActive}`}
        onClick={() => this.tab.select()}
      >
        {this.label}
      </Button>
    );
  }
}
