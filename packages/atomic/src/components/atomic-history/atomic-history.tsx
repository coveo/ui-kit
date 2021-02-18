import {Component, h, State} from '@stencil/core';
import {History, buildHistory, HistoryState} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-history',
  shadow: true,
})
export class AtomicHistory implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public history!: History;

  @State() public error!: Error;
  @BindStateToController('history') @State() historyState!: HistoryState;

  public initialize() {
    this.history = buildHistory(this.bindings.engine);
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
        <button
          disabled={!this.historyState.past.length}
          onClick={() => this.back()}
        >
          Back
        </button>
        <button
          disabled={!this.historyState.future.length}
          onClick={() => this.forward()}
        >
          Forward
        </button>
      </div>
    );
  }
}
