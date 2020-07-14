import {Component, h, State} from '@stencil/core';
import {headlessEngine} from '../../engine';
import {History, HistoryState, Unsubscribe} from '@coveo/headless';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory {
  private history: History;
  private unsubscribe: Unsubscribe;
  @State() state!: HistoryState;
  constructor() {
    this.history = new History(headlessEngine);
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
