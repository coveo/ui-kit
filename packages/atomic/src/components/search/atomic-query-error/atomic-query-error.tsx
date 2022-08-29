import {Component, h, State} from '@stencil/core';
import {QueryError, QueryErrorState, buildQueryError} from '@coveo/headless';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {QueryErrorCommon} from '../../common/query-error/query-error-common';

/**
 * The `atomic-query-error` component handles fatal errors when performing a query on the index or Search API. When the error is known, it displays a link to relevant documentation link for debugging purposes. When the error is unknown, it displays a small text area with the JSON content of the error.
 *
 * @part icon - The svg related to the error.
 * @part title - The title of the error.
 * @part description - A description of the error.
 * @part doc-link - A link to the relevant documentation.
 * @part more-info-btn - A button to request additional error information.
 * @part error-info - Additional error information.
 */
@Component({
  tag: 'atomic-query-error',
  styleUrl: 'atomic-query-error.pcss',
  shadow: true,
})
export class AtomicQueryError implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
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
