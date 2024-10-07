import {isUndefined} from '@coveo/bueno';
import {InteractiveProduct} from '@coveo/headless/commerce';
import {Product} from '@coveo/headless/commerce';
import {Component, h, Prop, Element} from '@stencil/core';
import {buildCustomEvent} from '../../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {getDefaultSlotFromHost} from '../../../../utils/slot-utils';
import {getAttributesFromLinkSlot} from '../../../common/item-link/attributes-slot';
import {LinkWithItemAnalytics} from '../../../common/item-link/item-link';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {
  InteractiveProductContext,
  ProductContext,
} from '../product-template-decorators';
import {buildStringTemplateFromProduct} from '../product-utils';

/**
 * @alpha
 * The `atomic-product-link` component automatically transforms a search product title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link.
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes. Use only with an "a" tag, e.g., `<a slot="attributes" target="_blank" download></a>`.
 *
 */
@Component({
  tag: 'atomic-product-link',
  styleUrl: 'atomic-product-link.pcss',
  shadow: false,
})
export class AtomicProductLink
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public error!: Error;

  public static isCompatibleWithProductList = true;

  @ProductContext() private product!: Product;
  @InteractiveProductContext() private interactiveProduct!: InteractiveProduct;

  @Element() private host!: HTMLElement;

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
  @Prop({reflect: true}) hrefTemplate?: string;

  private hasDefaultSlot!: boolean;
  private linkAttributes?: Attr[];
  private stopPropagation?: boolean;

  private logWarningIfNeed(warning?: string) {
    if (warning) {
      this.bindings.engine.logger.warn(warning);
    }
  }

  public initialize() {
    this.host.dispatchEvent(
      buildCustomEvent(
        'atomic/resolveStopPropagation',
        (stopPropagation: boolean) => {
          this.stopPropagation = stopPropagation;
        }
      )
    );
  }

  public connectedCallback() {
    const slotName = 'attributes';
    this.hasDefaultSlot = !!getDefaultSlotFromHost(this.host);
    this.linkAttributes = getAttributesFromLinkSlot(this.host, slotName);
  }

  public render() {
    const href = isUndefined(this.hrefTemplate)
      ? this.product.clickUri
      : buildStringTemplateFromProduct(
          this.hrefTemplate,
          this.product,
          this.bindings
        );

    if (!this.interactiveProduct) {
      return;
    }

    const {warningMessage} = this.interactiveProduct;

    return (
      <LinkWithItemAnalytics
        href={href}
        onSelect={() => {
          this.logWarningIfNeed(warningMessage);
          this.interactiveProduct.select();
        }}
        onBeginDelayedSelect={() => {
          this.logWarningIfNeed(warningMessage);
          this.interactiveProduct.beginDelayedSelect();
        }}
        onCancelPendingSelect={() => {
          this.logWarningIfNeed(warningMessage);
          this.interactiveProduct.cancelPendingSelect();
        }}
        attributes={this.linkAttributes}
        stopPropagation={this.stopPropagation}
      >
        {this.hasDefaultSlot ? (
          <slot />
        ) : (
          <atomic-product-text
            field="ec_name"
            default="no-title"
          ></atomic-product-text>
        )}
      </LinkWithItemAnalytics>
    );
  }
}
