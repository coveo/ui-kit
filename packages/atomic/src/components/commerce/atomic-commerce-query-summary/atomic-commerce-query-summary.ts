import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {localizedString} from '@/src/directives/localized-string';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderQuerySummaryContainer} from '../../common/query-summary/container';
import {renderQuerySummaryGuard} from '../../common/query-summary/guard';
import {getProductQuerySummaryI18nParameters} from '../../common/query-summary/utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-query-summary` component displays information about the current range of products (for example, "Products 1-10 of 123").
 *
 * @part container - The container for the whole summary.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the commerce interface is initializing.
 */
@customElement('atomic-commerce-query-summary')
@bindings()
@withTailwindStyles
export class AtomicCommerceQuerySummary
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  public bindings!: CommerceBindings;
  @state() error!: Error;
  static styles: CSSResultGroup = [
    css`
      :host {
        overflow: hidden;
      }
    `,
  ];

  @bindStateToController('listingOrSearchSummary')
  @state()
  private listingOrSearchSummaryState!:
    | SearchSummaryState
    | ProductListingSummaryState;
  public listingOrSearchSummary!: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  protected ariaMessage = new AriaLiveRegionController(this, 'query-summary');

  public initialize() {
    const controller =
      this.bindings.interfaceElement.type === 'product-listing'
        ? buildProductListing(this.bindings.engine)
        : buildSearch(this.bindings.engine);
    this.listingOrSearchSummary = controller.summary();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {
      firstProduct,
      firstRequestExecuted,
      lastProduct,
      totalNumberOfProducts,
      hasProducts,
      hasError,
      isLoading,
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
        isLoading,
      });

    this.ariaMessage.message = ariaLiveMessage;

    return html`${renderQuerySummaryGuard({
      props: {
        firstSearchExecuted: firstRequestExecuted,
        hasResults: hasProducts,
        hasError,
      },
    })(html`
      ${renderQuerySummaryContainer({props: {}})(
        html`${localizedString({
          i18n: this.bindings.i18n,
          key: i18nKey,
          params: {
            first: html`${highlights.first}`,
            last: html`${highlights.last}`,
            total: html`${highlights.total}`,
            query: html`${highlights.query}`,
          },
          count: lastProduct,
        })}`
      )}
    `)}`;
  }

  private isSearch(
    state: ProductListingSummaryState | SearchSummaryState
  ): state is SearchSummaryState {
    return 'query' in state;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-query-summary': AtomicCommerceQuerySummary;
  }
}
