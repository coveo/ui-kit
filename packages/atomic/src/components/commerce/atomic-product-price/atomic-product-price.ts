import {
  buildContext,
  type Context,
  type ContextState,
  type Product,
} from '@coveo/headless/commerce';
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map.js';
import {LightDomMixin} from '@/src/mixins/light-dom.js';
import {defaultCurrencyFormatter} from '../../common/formats/format-common.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import {parseValue} from '../product-template-component-utils/product-utils.js';

/**
 * The `atomic-product-price` component renders the price of a product.
 */
@customElement('atomic-product-price')
@bindings()
export class AtomicProductPrice
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles = css`
    atomic-product-price.display-grid div {
      flex-direction: column;
    }
  `;

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
    return (
      this.product! &&
      this.product.ec_promo_price !== null &&
      this.product.ec_price !== null &&
      this.product.ec_promo_price < this.product.ec_price
    );
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const hasPromo = this.hasPromotionalPrice;

    const priceClasses = tw({
      'truncate break-keep text-2xl leading-[1.5]': true,
      'text-error': hasPromo,
    });

    const promoClasses = tw({
      'original-price content-center truncate text-xl break-keep line-through leading-none': true,
      invisible: !hasPromo,
    });

    return html`
      <div class="flex flex-wrap gap-1">
        <div class=${multiClassMap(priceClasses)}>
          ${this.getFormattedValue(hasPromo ? 'ec_promo_price' : 'ec_price')}
        </div>
        <div class=${multiClassMap(promoClasses)}>
          ${hasPromo ? this.getFormattedValue('ec_price') : '\u200B'}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-price': AtomicProductPrice;
  }
}
