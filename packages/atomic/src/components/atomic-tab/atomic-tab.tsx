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
  styleUrl: 'atomic-tab.css',
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
      expression: this.expression,
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
    return (
      <button class="tab" onClick={() => this.handleClick()}>
        <span>
          <slot />
        </span>
      </button>
    );
  }
}
