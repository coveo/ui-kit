import {
  buildContext,
  Product,
  Context,
  ContextState,
} from '@coveo/headless/commerce';
import {Component, h} from '@stencil/core';
import {
  BindStateToController,
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
  public context!: Context;
  @BindStateToController('context') contextState!: ContextState;

  public initialize(): void {
    this.context = buildContext(this.bindings.engine);
  }

  public render() {
    const hasPromotionalPrice =
      this.product.ec_promo_price !== null &&
      this.product.ec_price !== null &&
      this.product.ec_promo_price < this.product.ec_price;

    const {currency} = this.contextState;

    return (
      <div class="flex flex-wrap">
        <atomic-product-numeric-field-value
          class={`truncate break-keep mx-1 ${hasPromotionalPrice && 'text-error'}`}
          field={hasPromotionalPrice ? 'ec_promo_price' : 'ec_price'}
        >
          <atomic-format-currency currency={currency}></atomic-format-currency>
        </atomic-product-numeric-field-value>
        {hasPromotionalPrice && (
          <atomic-product-numeric-field-value
            class="truncate break-keep mx-1 text-xl line-through"
            field="ec_price"
          >
            <atomic-format-currency
              currency={currency}
            ></atomic-format-currency>
          </atomic-product-numeric-field-value>
        )}
      </div>
    );
  }
}
