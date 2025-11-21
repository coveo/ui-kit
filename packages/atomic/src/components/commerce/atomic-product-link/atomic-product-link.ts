import {isUndefined} from '@coveo/bueno';
import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createInteractiveProductContextController} from '@/src/components/commerce/product-template-component-utils/context/interactive-product-context-controller.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {buildCustomEvent} from '@/src/utils/event-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {buildStringTemplateFromProduct} from '../product-template-component-utils/product-utils';
import '../atomic-product-text/atomic-product-text';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {
  type LightDOMWithSlots,
  SlotsForNoShadowDOMMixin,
} from '@/src/mixins/slots-for-no-shadow-dom-mixin';

/**
 * The `atomic-product-link` component automatically transforms a product `ec_name` into a clickable link that points to the original item.
 *
 * @slot default - The content to display inside the link.
 * @slot attributes - Use `<a slot="attributes" target="_blank"></a>` to pass custom attributes to the generated link.
 */
@customElement('atomic-product-link')
@bindings()
export class AtomicProductLink
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup =
    css`@reference '../../../utils/tailwind.global.tw.css';

atomic-product-link {
  a {
    @apply link-style;
  }
}`;

  /**
   * The [template literal](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) from which to generate the `href` attribute value
   *
   * The template literal can reference any number of product properties from the parent product. It can also reference the window object.
   *
   * For example, the following markup generates an `href` value such as `http://uri.com?id=itemTitle`, using the product's `clickUri` and `itemtitle` fields.
   * ```html
   * <atomic-product-link href-template='${clickUri}?id=${permanentid}'></atomic-product-link>
   * ```
   */
  @property({type: String, attribute: 'href-template', reflect: true})
  hrefTemplate?: string;

  @state() public product?: Product;
  @state() public interactiveProduct?: InteractiveProduct;

  public productController = createProductContextController(this);
  public interactiveProductController =
    createInteractiveProductContextController(this);

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  @state() private linkAttributes?: Attr[];
  private stopPropagation?: boolean;
  private removeLinkEventHandlers?: () => void;

  private logWarningIfNeeded(warning?: string) {
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

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.removeLinkEventHandlers) {
      this.removeLinkEventHandlers();
      this.removeLinkEventHandlers = undefined;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.product && this.interactiveProduct, () => {
      const product = this.product!;
      const interactiveProduct = this.interactiveProduct!;

      const href = isUndefined(this.hrefTemplate)
        ? product.clickUri
        : buildStringTemplateFromProduct(
            this.hrefTemplate,
            product,
            this.bindings
          );

      const {warningMessage} = interactiveProduct;
      this.linkAttributes = getAttributesFromLinkSlotContent(
        this,
        'attributes'
      );

      return renderLinkWithItemAnalytics({
        props: {
          href,
          onSelect: () => {
            this.logWarningIfNeeded(warningMessage);
            interactiveProduct.select();
          },
          onBeginDelayedSelect: () => {
            this.logWarningIfNeeded(warningMessage);
            interactiveProduct.beginDelayedSelect();
          },
          onCancelPendingSelect: () => {
            this.logWarningIfNeeded(warningMessage);
            interactiveProduct.cancelPendingSelect();
          },
          attributes: this.linkAttributes,
          stopPropagation: this.stopPropagation,
          onInitializeLink: (cleanupCallback) => {
            if (this.removeLinkEventHandlers) {
              this.removeLinkEventHandlers();
            }
            this.removeLinkEventHandlers = cleanupCallback;
          },
        },
      })(html`
          ${this.renderDefaultSlotContent(
            html`<atomic-product-text
            field="ec_name"
            default="no-title"
          ></atomic-product-text>`
          )}
        `);
    })}`;
  }
}

export interface AtomicProductLink extends LightDOMWithSlots {}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-link': AtomicProductLink;
  }
}
