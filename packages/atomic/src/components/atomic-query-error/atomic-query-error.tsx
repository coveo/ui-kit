import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError implements AtomicComponentInterface {
  @State() controllerState!: QueryErrorState;

  public bindings!: Bindings;
  public controller!: QueryError;

  @Initialization()
  public initialize() {
    this.controller = buildQueryError(this.bindings.engine);
  }

  private get results() {
    return this.controllerState.hasError ? (
      <div>
        <div>Oops {this.controllerState.error?.message}</div>
        <code>{JSON.stringify(this.controllerState.error)}</code>
      </div>
    ) : (
      ''
    );
  }

  public render() {
    return this.results;
  }
}
