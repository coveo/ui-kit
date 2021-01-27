import {Component, h, Prop, State} from '@stencil/core';
import {buildTab, Tab, TabProps, TabState} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';
/**
 * @part tab-button - The tab button
 * @part active-tab - The active tab
 */
@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.pcss',
  shadow: false,
})
export class AtomicTab implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  private tab!: Tab;

  @BindStateToController('tab') @State() private tabState!: TabState;
  @State() public error!: Error;

  @Prop() public expression = '';
  @Prop() public isActive = false;

  public initialize() {
    const options: TabProps = {
      options: {
        expression: this.expression,
      },
      initialState: {
        isActive: this.isActive,
      },
    };
    this.tab = buildTab(this.bindings.engine, options);
  }

  private handleClick() {
    this.tab.select();
  }

  public render() {
    let activeClass = 'btn-outline-primary';
    let activePart = {};
    if (this.tabState.isActive) {
      activeClass = 'active';
      activePart = {part: 'active-tab'};
    }
    return (
      <span {...activePart}>
        <button
          part="tab-button"
          class={'p-2 bg-primary border-none h-10 ' + activeClass}
          onClick={() => this.handleClick()}
        >
          <slot />
        </button>
      </span>
    );
  }
}
