import {
  ListingSummary,
  ListingSummaryState,
  Pagination,
  SearchSummary,
  SearchSummaryState,
  buildListingSummary,
  buildSearchSummary,
} from '@coveo/headless/commerce';
import {Component, h, State} from '@stencil/core';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LocalizedString} from '../../../utils/jsx-utils';
import {QuerySummaryContainer} from '../../common/query-summary/container';
import {QuerySummaryGuard} from '../../common/query-summary/guard';
import {getQuerySummaryI18nParameters} from '../../common/query-summary/utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-query-summary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part results - The container for the results.
 * @part duration - The container for the duration.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-query-summary',
  styleUrl: 'atomic-commerce-query-summary.pcss',
  shadow: true,
})
export class AtomicQuerySummary
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public listingOrSearchSummary!: SearchSummary | ListingSummary;
  public pagination!: Pagination;

  @BindStateToController('listingOrSearchSummary')
  @State()
  private listingOrSearchSummaryState!:
    | SearchSummaryState
    | ListingSummaryState;

  @State() public error!: Error;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearchSummary = buildListingSummary(this.bindings.engine);
    } else {
      this.listingOrSearchSummary = buildSearchSummary(this.bindings.engine);
    }
  }

  public render() {
    const {
      firstProduct,
      firstSearchExecuted,
      lastProduct,
      totalNumberOfProducts,
      hasProducts,
      hasError,
    } = this.listingOrSearchSummaryState;

    const {i18nKey, highlights, ariaLiveMessage} =
      getQuerySummaryI18nParameters({
        first: firstProduct,
        last: lastProduct,
        query: this.isSearch(this.listingOrSearchSummaryState)
          ? this.listingOrSearchSummaryState.query
          : '',
        total: totalNumberOfProducts,
        i18n: this.bindings.i18n,
        isLoading: false,
      });

    this.ariaMessage = ariaLiveMessage;

    return (
      <QuerySummaryGuard
        firstSearchExecuted={firstSearchExecuted}
        hasResults={hasProducts}
        hasError={hasError}
      >
        <QuerySummaryContainer>
          <LocalizedString
            key={i18nKey}
            i18n={this.bindings.i18n}
            params={highlights}
            count={lastProduct}
          />
        </QuerySummaryContainer>
      </QuerySummaryGuard>
    );
  }

  private isSearch(
    state: ListingSummaryState | SearchSummaryState
  ): state is SearchSummaryState {
    return 'query' in state;
  }
}
