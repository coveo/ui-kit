import {Component, h, Prop, State} from '@stencil/core';
import {
  QueryError,
  QueryErrorState,
  Unsubscribe,
  buildQueryError,
  Engine,
} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.css',
  shadow: true,
})
export class AtomicQueryError {
  @Prop({mutable: true}) engine!: Engine;
  @State() state!: QueryErrorState;

  private queryError!: QueryError;
  private unsubscribe: Unsubscribe = () => {};

  @Initialization()
  public initialize() {
    this.queryError = buildQueryError(this.engine);
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
