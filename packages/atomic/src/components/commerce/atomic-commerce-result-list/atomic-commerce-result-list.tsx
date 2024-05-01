import {
  buildProductListing,
  ProductListingState,
  ProductListing,
  buildSearch,
  SearchState,
  Search,
  Product,
} from '@coveo/headless/commerce';
import {Component, Element, Prop, State, h} from '@stencil/core';
import StarIcon from '../../../images/star.svg';
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

  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) display: 'grid' | 'list' = 'grid';

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: 'normal' | 'compact' = 'normal';

  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: number = 400;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.productListing = buildProductListing(this.bindings.engine);
      this.productListing.refresh();
    } else if (this.bindings.interfaceElement.type === 'search') {
      this.search = buildSearch(this.bindings.engine);
    }
  }

  private generateStarRating(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <atomic-icon
          class="w-5"
          style={
            i < rating ? {fill: 'gray'} : {fill: 'white', stroke: 'lightgray'}
          }
          icon={StarIcon}
        ></atomic-icon>
      );
    }

    return stars;
  }

  // TODO: Refactor to support result templates
  // TODO: Refactor to use guards/wrappers as in atomic-result-list
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
      <ul
        class={`mx-4 ${this.density === 'normal' ? 'gap-8' : 'gap-2'} ${this.display === 'grid' ? 'result-grid' : 'result-list'}`}
      >
        {products.map((product: Product) => (
          <a class="flex" href={product.clickUri}>
            <li class="p-2 border-2 rounded-md result-item hover:shadow">
              <img
                height={this.imageSize}
                width={this.imageSize}
                class="p-2 rounded"
                src={
                  product?.ec_thumbnails
                    ? product?.ec_thumbnails[0]
                    : `https://placehold.co/${this.imageSize}x${this.imageSize}/EEE/31343C`
                }
                alt="Product Thumbnail"
              />
              <div class="result-details">
                <div class="result-link">{product.ec_name}</div>
                <div class="star-rating">
                  {product.ec_rating &&
                    this.generateStarRating(product.ec_rating)}
                </div>
                <div class="text-2xl">${product.ec_price}</div>
              </div>
            </li>
          </a>
        ))}
      </ul>
    );
  }
}
