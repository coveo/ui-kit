import {Component, h, Prop, State} from '@stencil/core';
import {
  History,
  HistoryState,
  Unsubscribe,
  buildHistory,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory {
  @Prop({mutable: true}) engine!: Engine;
  @State() state!: HistoryState;

  private history!: History;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.history = buildHistory(this.engine);
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
