import {
  Pagination,
  PaginationState,
  ProductListing,
  ProductListingState,
  Search,
  SearchState,
  buildProductListing,
  buildSearch,
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
  public listingOrSearch!: ProductListing | Search;
  public pagination!: Pagination;

  @BindStateToController('querySummary')
  @State()
  private listingOrSearchState!: ProductListingState | SearchState;
  @BindStateToController('pagination')
  @State()
  private paginationState!: PaginationState;
  @State() public error!: Error;

  @AriaLiveRegion('query-summary')
  protected ariaMessage!: string;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }
    this.pagination = this.listingOrSearch.pagination();
  }

  public render() {
    console.log(this.bindings.engine.state.commerceSearch.queryExecuted);
    /*const {error, isLoading, products, responseId} = this.listingOrSearchState;
    const {pageSize, page, totalEntries, totalPages} = this.paginationState;
    buildSearchBox(this.bindings.engine).state.value
    buildSearch(this.bindings.engine).state.
    (this.listingOrSearch as SearchState).*/

    const {i18nKey, highlights, ariaLiveMessage} =
      getQuerySummaryI18nParameters({
        first: 1,
        last: 10,
        query: 'asd',
        total: 123,
        i18n: this.bindings.i18n,
        isLoading: false,
      });

    this.ariaMessage = ariaLiveMessage;

    return (
      <QuerySummaryGuard
        firstSearchExecuted={true}
        hasResults={true}
        hasError={false}
      >
        <QuerySummaryContainer>
          <LocalizedString
            key={i18nKey}
            bindings={this.bindings}
            params={highlights}
            count={123}
          />
        </QuerySummaryContainer>
      </QuerySummaryGuard>
    );
  }
}
