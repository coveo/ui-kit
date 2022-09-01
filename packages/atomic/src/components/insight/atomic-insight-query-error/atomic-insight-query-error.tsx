import {Component, h, State} from '@stencil/core';
import {
  QueryError,
  QueryErrorState,
  buildQueryError,
} from '@coveo/headless/insight';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {QueryErrorCommon} from '../../common/query-error/query-error-common';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-query-error',
  styleUrl: 'atomic-insight-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError
  implements InitializableComponent<InsightBindings>
{
  @InitializeBindings() public bindings!: InsightBindings;
  public queryError!: QueryError;

  @BindStateToController('queryError')
  @State()
  private queryErrorState!: QueryErrorState;
  @State() public error!: Error;
  @State() showMoreInfo = false;

  @AriaLiveRegion('query-error')
  protected ariaMessage!: string;

  public initialize() {
    this.queryError = buildQueryError(this.bindings.engine);
  }

  public render() {
    return (
      <QueryErrorCommon
        bindings={this.bindings}
        onShowMoreInfo={() => (this.showMoreInfo = true)}
        queryErrorState={this.queryErrorState}
        setAriaLive={(msg) => (this.ariaMessage = msg)}
        showMoreInfo={this.showMoreInfo}
      />
    );
  }
}
