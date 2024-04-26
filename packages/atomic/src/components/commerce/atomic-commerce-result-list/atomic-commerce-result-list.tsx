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
 * The `atomic-commerce-result-list` component is responsible for displaying product results.
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
    }
  }

  public render() {
    const products =
      this.bindings.interfaceElement.type === 'product-listing'
        ? this.productListingState.products
        : this.searchState.products;

    if (
      products.length === 0 &&
      !this.productListingState?.isLoading &&
      !this.searchState?.isLoading
    ) {
      return <div>No products found.</div>;
    }

    return (
      <ul class="gap-4 result-grid">
        {products.map((product) => (
          <a class="flex" href={product.clickUri}>
            <li class="p-2 mx-auto border-2 rounded-md hover:shadow">
              <img
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
}
