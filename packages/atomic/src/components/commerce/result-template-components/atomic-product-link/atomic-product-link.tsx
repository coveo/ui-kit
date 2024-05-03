import {isUndefined} from '@coveo/bueno';
import {InteractiveResult as InteractiveProduct} from '@coveo/headless/commerce';
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
import {Bindings} from '../../../search/atomic-search-interface/atomic-search-interface';
import {
  InteractiveProductContext,
  ProductContext,
} from '../product-template-decorators';

/**
 * The `atomic-product-link` component automatically transforms a search product title into a clickable link that points to the original item.
 * @slot default - Lets you display alternative content inside the link
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to the link element, overriding other attributes, to be used exclusively with an "a" tag such as `<a slot="attributes" target="_blank" download></a>`.
 */
@Component({
  tag: 'atomic-product-link',
  styleUrl: 'atomic-product-link.pcss',
  shadow: false,
})
export class AtomicProductLink implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  public error!: Error;

  public static isCompatibleWithProductList = true;

  @ProductContext() private product!: Product;
  @InteractiveProductContext() private interactiveProduct!: InteractiveProduct;

  @Element() private host!: HTMLElement;

  /**
   * Specifies a template literal from which to generate the `href` attribute value (see
   * [Template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)).
   *
   * The template literal can reference any number of product properties from the parent product. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the product's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-product-link href-template='${clickUri}?id=${raw.itemtitle}'></atomic-product-link>
   * ```
   */
  @Prop({reflect: true}) hrefTemplate?: string;

  private hasDefaultSlot!: boolean;
  private linkAttributes?: Attr[];
  private stopPropagation?: boolean;

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
    console.log(this);
    const href = isUndefined(this.hrefTemplate)
      ? this.product.clickUri
      : 'test';

    return (
      <LinkWithItemAnalytics
        href={href}
        onSelect={() => this.interactiveProduct.select()}
        onBeginDelayedSelect={() =>
          this.interactiveProduct.beginDelayedSelect()
        }
        onCancelPendingSelect={() =>
          this.interactiveProduct.cancelPendingSelect()
        }
        attributes={this.linkAttributes}
        stopPropagation={this.stopPropagation}
      >
        {this.hasDefaultSlot ? (
          <slot />
        ) : (
          <atomic-result-text
            shouldHighlight={false}
            field="ec_name"
            default="no-title"
          ></atomic-result-text>
        )}
      </LinkWithItemAnalytics>
    );
  }
}
