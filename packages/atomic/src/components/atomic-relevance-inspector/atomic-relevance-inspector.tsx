import {Component, h, State, Prop} from '@stencil/core';
import {
  Debug,
  DebugState,
  Unsubscribe,
  buildDebug,
  Engine,
} from '@coveo/headless';

@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector {
  @State() state!: DebugState;
  @Prop() engine!: Engine;

  private debug!: Debug;
  private unsubscribe: Unsubscribe = () => {};

  constructor() {
    this.debug = buildDebug(this.engine);
    this.unsubscribe = this.debug.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.debug.state;
  }

  public render() {
    if (!this.state.isEnabled) {
      return;
    }

    // TODO: Display data in a cleaner manner
    return <div>{JSON.stringify(this.debug.state)}</div>;
  }
}
