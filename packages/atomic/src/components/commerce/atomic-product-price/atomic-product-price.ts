import {
  buildContext,
  type Context,
  type ContextState,
  type Product,
} from '@coveo/headless/commerce';
import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import {injectStylesForNoShadowDOM} from '@/src/decorators/inject-styles-for-no-shadow-dom.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map.js';
import {defaultCurrencyFormatter} from '../../common/formats/format-common.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import {parseValue} from '../product-template-component-utils/product-utils.js';
import styles from './atomic-product-price.tw.css';

/**
 * The `atomic-product-price` component renders the price of a product.
 * @alpha
 */
@customElement('atomic-product-price')
@bindings()
@injectStylesForNoShadowDOM
@withTailwindStyles
export class AtomicProductPrice
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles = unsafeCSS(styles);

  @state()
  bindings!: CommerceBindings;

  @state()
  error!: Error;

  private productController = createProductContextController(this);
  context!: Context;

  @bindStateToController('context')
  @state()
  contextState!: ContextState;

  initialize() {
    this.context = buildContext(this.bindings.engine);
  }

  private get product(): Product | null {
    return this.productController.item;
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

  private getFormattedValue(field: string) {
    const value = parseValue(this.product!, field);
    if (value !== null) {
      return this.formatValue(value);
    }
  }

  private get hasPromotionalPrice() {
    if (!this.product) {
      return false;
    }
    return (
      this.product.ec_promo_price !== null &&
      this.product.ec_price !== null &&
      this.product.ec_promo_price < this.product.ec_price
    );
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const priceClasses = tw({
      'truncate break-keep text-2xl': true,
      'text-error': this.hasPromotionalPrice,
    });
    return html`
      <div class="flex flex-wrap gap-1">
        <div
          class=${multiClassMap(priceClasses)}
        >
          ${this.getFormattedValue(
            this.hasPromotionalPrice ? 'ec_promo_price' : 'ec_price'
          )}
        </div>

        ${when(
          this.hasPromotionalPrice,
          () => html`
            <div class="original-price content-center truncate text-xl break-keep line-through">
              ${this.getFormattedValue('ec_price')}
            </div>
          `
        )}
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-price': AtomicProductPrice;
  }
}
