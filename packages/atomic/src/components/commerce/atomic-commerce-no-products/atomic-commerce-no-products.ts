import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils.js';
import {renderNoItemsContainer} from '../../common/no-items/container.js';
import {noItemsGuard} from '../../common/no-items/guard.js';
import {renderMagnifyingGlass} from '../../common/no-items/magnifying-glass.js';
import {renderNoItems} from '../../common/no-items/no-items.js';
import {renderSearchTips} from '../../common/no-items/tips.js';
import {getSummary} from '../../common/no-items/utils.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';

/**
 * The `atomic-commerce-no-products` component displays search tips when there are no products. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part no-results - The text indicating that no products were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 *
 * @slot default - Any additional content slotted inside of its element will be displayed as well.
 */
@customElement('atomic-commerce-no-products')
@bindings()
@withTailwindStyles
export class AtomicCommerceNoProducts
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;

  @bindStateToController('summary')
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  @state()
  public error!: Error;

  protected ariaMessage = new AriaLiveRegionController(this, 'no-products');

  public initialize() {
    const controller =
      this.bindings.interfaceElement.type === 'search'
        ? buildSearch(this.bindings.engine)
        : buildProductListing(this.bindings.engine);
    this.summary = controller.summary();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {
      bindings: {i18n},
    } = this;

    const query = 'query' in this.summaryState ? this.summaryState.query : '';
    this.ariaMessage.message = getSummary(
      i18n,
      query,
      this.summary.state.hasProducts,
      'no-products'
    );

    return html`${noItemsGuard(
      {
        isLoading: this.summaryState.isLoading,
        firstSearchExecuted: this.summaryState.firstRequestExecuted,
        hasResults: this.summaryState.hasProducts,
      },
      () =>
        renderNoItemsContainer()(html`
          ${renderMagnifyingGlass()} 
          ${this.renderNoItems()}
          ${this.renderSearchTips()}
        `)
    )}`;
  }

  private renderNoItems() {
    return renderNoItems({
      props: {
        query: 'query' in this.summaryState ? this.summaryState.query : '',
        i18n: this.bindings.i18n,
        i18nKey: 'no-products',
      },
    });
  }

  private renderSearchTips() {
    return renderSearchTips({
      props: {
        i18n: this.bindings.i18n,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-no-products': AtomicCommerceNoProducts;
  }
}
