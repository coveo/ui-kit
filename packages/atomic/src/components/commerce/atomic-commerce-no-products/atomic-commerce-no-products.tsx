import {
  SearchSummary,
  ListingSummary,
  buildSearchSummary,
  buildListingSummary,
  SearchSummaryState,
  ListingSummaryState,
} from '@coveo/headless/commerce';
import {Component, State, h} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {NoItemsContainer} from '../../common/no-items/container';
import {NoItemsGuard} from '../../common/no-items/guard';
import {MagnifyingGlass} from '../../common/no-items/magnifying-glass';
import {NoItems} from '../../common/no-items/no-items';
import {SearchTips} from '../../common/no-items/tips';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * @internal
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
  public summary!: SearchSummary | ListingSummary;
  @BindStateToController('summary')
  @State()
  private summaryState!: SearchSummaryState | ListingSummaryState;
  @State() public error!: Error;

  public initialize() {
    this.summary =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearchSummary(this.bindings.engine)
        : buildListingSummary(this.bindings.engine);
  }
  render() {
    const {
      bindings: {i18n},
    } = this;
    return (
      <NoItemsGuard
        {...this.summaryState}
        hasResults={this.summaryState.hasProducts}
      >
        <NoItemsContainer>
          <MagnifyingGlass />
          <NoItems
            query={'query' in this.summaryState ? this.summaryState.query : ''}
            i18n={i18n}
          />
          <SearchTips i18n={i18n} />
        </NoItemsContainer>
      </NoItemsGuard>
    );
  }
}
