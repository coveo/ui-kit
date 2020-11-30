import {Component, h, Prop, State} from '@stencil/core';
import {
  Debug,
  DebugState,
  Unsubscribe,
  buildDebug,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-debug',
  shadow: true,
})
export class AtomicDebug {
  @State() state!: DebugState;
  @Prop() enabled = true;

  private engine!: Engine;
  private debug!: Debug;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.debug = buildDebug(this.engine, {options: {enabled: this.enabled}});
    this.unsubscribe = this.debug.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.debug.state;
  }

  render() {
    if (!this.state.isEnabled) {
      return;
    }

    // Display data in a cleaner manner
    return <div>{JSON.stringify(this.debug.state)}</div>;
  }
}
