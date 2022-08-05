import {Component, h, Prop, State} from '@stencil/core';
import {buildInsightTab, InsightTab, InsightTabState} from '..';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {Button} from '../../common/button';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 *
 * @internal
 */
@Component({
  tag: 'atomic-insight-tab',
  styleUrl: './atomic-insight-tab.pcss',
})
export class AtomicInsightTab
  implements InitializableComponent<InsightBindings>
{
  private tab!: InsightTab;
  private tabId = randomID('insight-tab');

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
  @Prop({reflect: true}) public active = false;

  /**
   * The expression that will be passed to the search as a `cq` paramenter upon being selected.
   */
  @Prop() public expression!: string;

  public initialize() {
    this.tab = buildInsightTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
      initialState: {isActive: this.active},
    });
  }

  public render() {
    if (!this.bindings.store.isAppLoaded()) {
      return;
    }

    return (
      <Button
        style="text-transparent"
        part="tab"
        class={this.tabState.isActive ? 'active' : ''}
        ariaLabel={this.label}
        onClick={() => this.tab.select()}
      >
        {this.label}
      </Button>
    );
  }
}
