import {Component, h, State, Event, EventEmitter} from '@stencil/core';
import {
  Debug,
  DebugState,
  Unsubscribe,
  buildDebug,
  Engine,
} from '@coveo/headless';
import {InitializeEventHandler} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-relevance-inspector',
  shadow: true,
})
export class AtomicRelevanceInspector {
  @State() state!: DebugState;
  @Event({eventName: 'atomic/initializeComponent'}) initialize!: EventEmitter<
    InitializeEventHandler
  >;

  private engine!: Engine;
  private debug!: Debug;
  private unsubscribe: Unsubscribe = () => {};

  public connectedCallback() {
    this.initialize.emit((engine) => {
      this.engine = engine;
      this.debug = buildDebug(this.engine);
      this.unsubscribe = this.debug.subscribe(() => this.updateState());
    });
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.debug.state;
  }

  render() {
    if (!this.engine || !this.state.isEnabled) {
      return;
    }

    // Display data in a cleaner manner
    return <div>{JSON.stringify(this.debug.state)}</div>;
  }
}
