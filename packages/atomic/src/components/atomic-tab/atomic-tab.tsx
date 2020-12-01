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

@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.scss',
  shadow: true,
})
export class AtomicTab {
  @Prop() expression = '';
  @Prop() isActive = false;
  @State() state!: TabState;

  private engine!: Engine;
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
    const activeClass = this.state.isActive ? 'active' : '';
    return (
      <nav class="nav nav-pills nav-item nav-justified">
        <a class={`nav-link ${activeClass}`} onClick={() => this.handleClick()}>
          <slot />
        </a>
      </nav>
    );
  }
}
