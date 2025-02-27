import {
  buildProductListing,
  buildSearch,
  Pagination,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {LocalizedString} from '../../../utils/jsx-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {QuerySummaryContainer} from '../../common/query-summary/container';
import {QuerySummaryGuard} from '../../common/query-summary/guard';
import {getProductQuerySummaryI18nParameters} from '../../common/query-summary/utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-query-summary` component displays information about the current range of results and the request duration (e.g., "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part results - The container for the results.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 *
 * @alpha
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
  public listingOrSearchSummary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  public pagination!: Pagination;

  @BindStateToController('listingOrSearchSummary')
  @State()
  private listingOrSearchSummaryState!:
    | SearchSummaryState
    | ProductListingSummaryState;

  @State() public error!: Error;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    const controller =
      this.bindings.interfaceElement.type === 'product-listing'
        ? buildProductListing(this.bindings.engine)
        : buildSearch(this.bindings.engine);
    this.listingOrSearchSummary = controller.summary();
  }

  public render() {
    const {
      firstProduct,
      firstRequestExecuted,
      lastProduct,
      totalNumberOfProducts,
      hasProducts,
      hasError,
    } = this.listingOrSearchSummaryState;

    const {i18nKey, highlights, ariaLiveMessage} =
      getProductQuerySummaryI18nParameters({
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
        firstSearchExecuted={firstRequestExecuted}
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
    state: ProductListingSummaryState | SearchSummaryState
  ): state is SearchSummaryState {
    return 'query' in state;
  }
}
