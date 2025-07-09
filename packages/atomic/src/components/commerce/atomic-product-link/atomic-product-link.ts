import {isUndefined} from '@coveo/bueno';
import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {
  createInteractiveProductContextController,
  createProductContextController,
} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {injectStylesForNoShadowDOM} from '@/src/decorators/light-dom';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {buildCustomEvent} from '../../../utils/event-utils';
import {getDefaultSlotFromHost} from '../../../utils/slot-utils';
import {getAttributesFromLinkSlot} from '../../common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '../../common/item-link/item-link';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {buildStringTemplateFromProduct} from '../product-template-component-utils/product-utils';
import '../atomic-product-text/atomic-product-text';
import styles from './atomic-product-link.tw.css';

/**
 * @alpha
 * The `atomic-product-link` component automatically transforms a search product title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link.
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes. Use only with an "a" tag, e.g., `<a slot="attributes" target="_blank" download></a>`.
 *
 */
@customElement('atomic-product-link')
@bindings()
@injectStylesForNoShadowDOM
@withTailwindStyles
export class AtomicProductLink
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles = unsafeCSS(styles);

  public static isCompatibleWithProductList = true;

  /**
   * The [template literal](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) from which to generate the `href` attribute value
   *
   * The template literal can reference any number of product properties from the parent product. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the product's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-product-link href-template='${clickUri}?id=${permanentId}'></atomic-product-link>
   * ```
   */
  @property({type: String, attribute: 'href-template', reflect: true})
  hrefTemplate?: string;

  @state() private product!: Product;
  @state() private interactiveProduct!: InteractiveProduct;

  private productController = createProductContextController(this);
  private interactiveProductController =
    createInteractiveProductContextController(this);

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  private hasDefaultSlot!: boolean;
  private linkAttributes?: Attr[];
  private stopPropagation?: boolean;

  private logWarningIfNeed(warning?: string) {
    if (warning) {
      this.bindings.engine.logger.warn(warning);
    }
  }

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
    if (
      !this.interactiveProduct &&
      this.interactiveProductController.interactiveItem
    ) {
      this.interactiveProduct =
        this.interactiveProductController.interactiveItem;
    }

    this.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
  }

  connectedCallback() {
    super.connectedCallback();
    const slotName = 'attributes';
    this.hasDefaultSlot = !!getDefaultSlotFromHost(this);
    this.linkAttributes = getAttributesFromLinkSlot(this, slotName);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      this.product && this.interactiveProduct,
      () => {
        const href = isUndefined(this.hrefTemplate)
          ? this.product.clickUri
          : buildStringTemplateFromProduct(
              this.hrefTemplate,
              this.product,
              this.bindings
            );

        const {warningMessage} = this.interactiveProduct;

        return renderLinkWithItemAnalytics({
          props: {
            href,
            onSelect: () => {
              this.logWarningIfNeed(warningMessage);
              this.interactiveProduct.select();
            },
            onBeginDelayedSelect: () => {
              this.logWarningIfNeed(warningMessage);
              this.interactiveProduct.beginDelayedSelect();
            },
            onCancelPendingSelect: () => {
              this.logWarningIfNeed(warningMessage);
              this.interactiveProduct.cancelPendingSelect();
            },
            attributes: this.linkAttributes,
            stopPropagation: this.stopPropagation,
          },
        })(html`
          ${when(
            this.hasDefaultSlot,
            () => html`<slot></slot>`,
            () => html`<atomic-product-text
              field="ec_name"
              default="no-title"
            ></atomic-product-text>`
          )}
        `);
      },
      () => nothing
    )}`;
  }
}
