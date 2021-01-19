import {Component, h, State} from '@stencil/core';
import {
  History,
  HistoryState,
  Unsubscribe,
  buildHistory,
} from '@coveo/headless';
import {Initialization, Bindings} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory {
  @State() state!: HistoryState;

  public bindings!: Bindings;
  private history!: History;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.history = buildHistory(this.bindings.engine);
    this.unsubscribe = this.history.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.history.state;
  }

  private back() {
    this.history.back();
  }

  private forward() {
    this.history.forward();
  }

  public render() {
    return (
      <div>
        <button onClick={() => this.back()}>BACK</button>
        <button onClick={() => this.forward()}>FORWARD</button>
      </div>
    );
  }
}
