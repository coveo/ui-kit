import {
  SearchSummaryState,
  ProductListingSummaryState,
  Summary,
  buildSearch,
  buildProductListing,
} from '@coveo/headless/commerce';
import {Component, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {AriaLiveRegion} from '../../../utils/stencil-accessibility-utils';
import {NoItemsContainer} from '../../common/no-items/container';
import {NoItemsGuard} from '../../common/no-items/guard';
import {MagnifyingGlass} from '../../common/no-items/magnifying-glass';
import {NoItems} from '../../common/no-items/no-items';
import {SearchTips} from '../../common/no-items/tips';
import {getSummary} from '../../common/no-items/utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * @alpha
 *
 * The `atomic-no-products` component displays search tips when there are no products. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part no-results - The text indicating that no products were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 *
 * @slot default - Any additional content slotted inside of its element will be displayed as well.
 */
@Component({
  tag: 'atomic-commerce-no-products',
  styleUrl: 'atomic-commerce-no-products.pcss',
  shadow: true,
})
export class AtomicCommerceNoProducts
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;
  @BindStateToController('summary')
  @State()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;
  @State() public error!: Error;
  @AriaLiveRegion('no-products')
  protected ariaMessage!: string;

  public initialize() {
    const controller =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);
    this.summary = controller.summary();
  }
  render() {
    const {
      bindings: {i18n},
    } = this;

    this.ariaMessage = getSummary(
      i18n,
      'query' in this.summaryState ? this.summaryState.query : '',
      this.summary.state.hasProducts,
      'no-products'
    );

    return (
      <NoItemsGuard
        isLoading={this.summaryState.isLoading}
        firstSearchExecuted={this.summaryState.firstRequestExecuted}
        hasResults={this.summaryState.hasProducts}
      >
        <NoItemsContainer>
          <MagnifyingGlass />
          <NoItems
            query={'query' in this.summaryState ? this.summaryState.query : ''}
            i18n={i18n}
            i18nKey="no-products"
          />
          <SearchTips i18n={i18n} />
        </NoItemsContainer>
      </NoItemsGuard>
    );
  }
}
