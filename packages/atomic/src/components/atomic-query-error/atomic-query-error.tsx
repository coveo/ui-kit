import {Component, h, State} from '@stencil/core';
import {
  QueryError,
  QueryErrorState,
  Unsubscribe,
  buildQueryError,
} from '@coveo/headless';
import {Initialization, Bindings} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.css',
  shadow: true,
})
export class AtomicQueryError {
  @State() state!: QueryErrorState;

  public bindings!: Bindings;
  private queryError!: QueryError;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
    this.unsubscribe = this.queryError.subscribe(() => this.updateState());
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }

  private updateState() {
    this.state = this.queryError.state;
  }

  private get results() {
    return this.state.hasError ? (
      <div>
        <div>Oops {this.state.error?.message}</div>
        <code>{JSON.stringify(this.state.error)}</code>
      </div>
    ) : (
      ''
    );
  }

  public render() {
    return this.results;
  }
}
