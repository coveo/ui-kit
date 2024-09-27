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
import {defaultCurrencyFormatter} from '../../../common/formats/format-common';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';
import {parseValue} from '../product-utils';

/**
 * @alpha
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

  private formatValue(value: number) {
    try {
      const {currency} = this.contextState;
      const formatter = defaultCurrencyFormatter(currency);
      return formatter(value, this.bindings.i18n.languages as string[]);
    } catch (error) {
      this.error = error as Error;
      return value.toString();
    }
  }

  private parse(field: string) {
    try {
      return parseValue(this.product, field);
    } catch (error) {
      this.error = error as Error;
      return null;
    }
  }

  private getFormattedValue(field: string) {
    const value = this.parse(field);
    if (value !== null) {
      return this.formatValue(value);
    }
  }

  private get hasPromotionalPrice() {
    return (
      this.product.ec_promo_price !== null &&
      this.product.ec_price !== null &&
      this.product.ec_promo_price < this.product.ec_price
    );
  }

  public render() {
    const mainPrice = this.getFormattedValue(
      this.hasPromotionalPrice ? 'ec_promo_price' : 'ec_price'
    );

    const originalPrice = this.hasPromotionalPrice
      ? this.getFormattedValue('ec_price')
      : null;

    return (
      <div class="flex flex-wrap">
        <div
          class={`mx-1 truncate break-keep ${this.hasPromotionalPrice && 'text-error'}`}
        >
          {mainPrice}
        </div>
        {originalPrice && (
          <div class="mx-1 truncate break-keep text-xl line-through">
            {originalPrice}
          </div>
        )}
      </div>
    );
  }
}
