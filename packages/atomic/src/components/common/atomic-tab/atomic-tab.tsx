import {buildTab, Tab, TabState} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';
import {Button} from '../button';

/**
 * @internal
 */
@Component({
  tag: 'atomic-tab',
  styleUrl: './atomic-tab.pcss',
  shadow: true,
})
export class AtomicTab implements InitializableComponent {
  private tab!: Tab;
  private tabId = randomID('ipx-tab');

  @InitializeBindings() public bindings!: Bindings;

  @State() public error!: Error;

  @BindStateToController('tab')
  @State()
  private tabState!: TabState;

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
    this.tab = buildTab(this.bindings.engine, {
      options: {expression: this.expression, id: this.tabId},
      initialState: {isActive: this.active},
    });
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
