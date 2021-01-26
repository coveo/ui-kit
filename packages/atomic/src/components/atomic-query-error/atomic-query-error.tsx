import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  Bindings,
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.pcss',
  shadow: false,
})
export class AtomicQueryError implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public queryError!: QueryError;

  @BindStateToController('queryError')
  @State()
  private queryErrorState!: QueryErrorState;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  private get results() {
    return this.queryErrorState.hasError ? (
      <div>
        <div>Oops {this.queryErrorState.error?.message}</div>
        <code>{JSON.stringify(this.queryErrorState.error)}</code>
      </div>
    ) : (
      ''
    );
  }

  public render() {
    return this.results;
  }
}
