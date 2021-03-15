import {Component, h, State} from '@stencil/core';
import {
  HistoryManager,
  buildHistoryManager,
  HistoryManagerState,
} from '@coveo/headless';
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
  public history!: HistoryManager;

  @State() public error!: Error;
  @BindStateToController('history') @State() historyState!: HistoryManagerState;

  public initialize() {
    this.history = buildHistoryManager(this.bindings.engine);
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
