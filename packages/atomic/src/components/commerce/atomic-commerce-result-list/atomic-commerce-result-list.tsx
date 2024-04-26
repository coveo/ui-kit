import {
  buildProductListing,
  ProductListingState,
  ProductListing,
  buildSearch,
  Search,
} from '@coveo/headless/commerce';
import {SearchState} from '@coveo/headless/dist/definitions/controllers/commerce/search/headless-search';
import {Component, Element, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-result-list` component is responsible for displaying query results by applying one or more result templates.
 *
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it, when results are displayed as a grid
 * @part result-list-grid-clickable - The clickable link encompassing the result when results are displayed as a grid
 * @part result-table - The element of the result table containing a heading and a body
 * @part result-table-heading - The element containing the row of cells in the result table's heading
 * @part result-table-heading-row - The element containing cells of the result table's heading
 * @part result-table-heading-cell - The element representing a cell of the result table's heading
 * @part result-table-body - The element containing the rows of the result table's body
 * @part result-table-row - The element containing the cells of a row in the result table's body
 * @part result-table-row-odd - The element containing the cells of an odd row in the result table's body
 * @part result-table-row-even - The element containing the cells of an even row in the result table's body
 * @part result-table-cell - The element representing a cell of the result table's body
 */
@Component({
  tag: 'atomic-commerce-result-list',
  styleUrl: 'atomic-commerce-result-list.pcss',
  shadow: true,
})
export class AtomicCommerceResultList
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public productListing!: ProductListing;
  public search!: Search;
  // public resultsPerPage!: ResultsPerPage;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('productListing')
  @State()
  private productListingState!: ProductListingState;
  @BindStateToController('search')
  @State()
  private searchState!: SearchState;
  @State() public error!: Error;

  public initialize() {
    if (this.host.innerHTML.includes('<atomic-result-children')) {
      console.warn(
        'Folded results will not render any children for the "atomic-result-list". Please use "atomic-folded-result-list" instead.'
      );
    }

    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.productListing = buildProductListing(this.bindings.engine);
      this.productListing.refresh();
    } else if (this.bindings.interfaceElement.type === 'search') {
      this.search = buildSearch(this.bindings.engine);
      //  this.search.executeFirstSearch();
    }

    //this.resultsPerPage = buildResultsPerPage(this.bindings.engine);
  }

  public renderProductListing() {
    return (
      <ul class="grid gap-8 px-4 mx-auto result-grid">
        {this.productListingState.products.map((product) => (
          <a class="w-full group" href={product.clickUri}>
            <li class="w-full h-full p-4 border-2 rounded-md group-hover:shadow">
              <img
                height={100}
                width={100}
                class="p-2 mx-auto rounded"
                src={
                  product?.ec_thumbnails
                    ? product?.ec_thumbnails[0]
                    : 'https://placehold.co/100x100/EEE/31343C'
                }
                alt="Product Thumbnail"
              />

              <div class="result-link">{product.ec_name}</div>
              <div class="text-xl">${product.ec_price}</div>
            </li>
          </a>
        ))}
      </ul>
    );
  }
  public renderSearch() {
    return (
      <ul class="grid gap-4 result-grid">
        {this.searchState.products.map((product) => (
          <a class="flex group" href={product.clickUri}>
            <li class="p-2 mx-auto border-2 rounded-md group-hover:shadow">
              <img
                height={400}
                width={400}
                class="p-2 rounded"
                src={
                  product?.ec_thumbnails
                    ? product?.ec_thumbnails[0]
                    : 'https://placehold.co/100x100/EEE/31343C'
                }
                alt="Product Thumbnail"
              />

              <div class="result-link">{product.ec_name}</div>
              <div class="text-xl">${product.ec_price}</div>
            </li>
          </a>
        ))}
      </ul>
    );
  }

  public render() {
    return (
      <div class="w-full">
        {this.bindings.interfaceElement.type === 'product-listing'
          ? this.renderProductListing()
          : this.renderSearch()}
      </div>
    );
  }
}
