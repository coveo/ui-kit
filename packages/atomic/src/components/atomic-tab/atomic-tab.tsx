import {Component, h, Prop, State} from '@stencil/core';
import {
  buildTab,
  Engine,
  Tab,
  TabProps,
  TabState,
  Unsubscribe,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';
/**
 * @part tab-button - The tab button
 * @part active-tab - The active tab
 */
@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.scss',
  shadow: true,
})
export class AtomicTab {
  @Prop({mutable: true}) engine!: Engine;
  @Prop() expression = '';
  @Prop() isActive = false;
  @State() state!: TabState;

  private tab!: Tab;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    const options: TabProps = {
      options: {
        expression: this.expression,
      },
      initialState: {
        isActive: this.isActive,
      },
    };
    this.tab = buildTab(this.engine, options);
    this.unsubscribe = this.tab.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.tab.state;
  }

  public handleClick() {
    this.tab.select();
  }

  render() {
    let activeClass = 'btn-outline-primary';
    let activePart = {};
    if (this.state.isActive) {
      activeClass = 'active';
      activePart = {part: 'active-tab'};
    }
    return (
      <span class="nav nav-pills" {...activePart}>
        <button
          part="tab-button"
          class={`nav-link btn  ${activeClass}`}
          onClick={() => this.handleClick()}
        >
          <slot />
        </button>
      </span>
    );
  }
}
