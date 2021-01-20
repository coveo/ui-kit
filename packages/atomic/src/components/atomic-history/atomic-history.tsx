import {Component, h, State} from '@stencil/core';
import {History, HistoryState, buildHistory} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory implements AtomicComponentInterface {
  @State() controllerState!: HistoryState;

  public bindings!: Bindings;
  public controller!: History;

  @Initialization()
  public initialize() {
    this.controller = buildHistory(this.bindings.engine);
  }

  private back() {
    this.controller.back();
  }

  private forward() {
    this.controller.forward();
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
