import {Product} from '@coveo/headless/commerce';
import {Component, h, Prop} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

/**
 * @internal
 * The `atomic-product-price` component renders the price of a product.
 */
@Component({
  tag: 'atomic-product-price',
  shadow: false,
})
export class AtomicProductPrice
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public error!: Error;

  @ProductContext() private product!: Product;

  /**
   * The currency to use in currency formatting. Allowed values are the [ISO 4217 currency codes](https://www.six-group.com/en/products-services/financial-information/data-standards.html#scrollTo=maintenance-agency), such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB.
   */
  @Prop({reflect: true}) public currency: string = 'USD';

  public render() {
    const hasPromotionalPrice =
      this.product?.ec_promo_price !== undefined &&
      this.product?.ec_price !== undefined &&
      this.product?.ec_promo_price < this.product?.ec_price;

    return (
      <div class="flex flex-wrap">
        <atomic-product-numeric-field-value
          class={`truncate break-keep mx-1 ${hasPromotionalPrice && 'text-error'}`}
          field={hasPromotionalPrice ? 'ec_promo_price' : 'ec_price'}
        >
          <atomic-format-currency
            currency={this.currency}
          ></atomic-format-currency>
        </atomic-product-numeric-field-value>
        {hasPromotionalPrice && (
          <atomic-product-numeric-field-value
            class="truncate break-keep mx-1 text-xl line-through"
            field="ec_price"
          >
            <atomic-format-currency
              currency={this.currency}
            ></atomic-format-currency>
          </atomic-product-numeric-field-value>
        )}
      </div>
    );
  }
}
