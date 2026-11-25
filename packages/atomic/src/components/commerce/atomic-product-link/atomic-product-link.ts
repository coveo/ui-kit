import {isUndefined} from '@coveo/bueno';
import type {InteractiveProduct, Product} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {createInteractiveProductContextController} from '@/src/components/commerce/product-template-component-utils/context/interactive-product-context-controller.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {
  clickItemLink,
  renderLinkWithItemAnalytics,
} from '@/src/components/common/item-link/item-link';
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
import styles from './atomic-product-link.tw.css';

/**
 * The `atomic-product-link` component automatically transforms a product `ec_name` into a clickable link that points to the original item.
 *
 * @slot default - The content to display inside the link.
 * @slot attributes - Use `<a slot="attributes" target="_blank"></a>` to pass custom attributes to the generated link.
 */
@customElement('atomic-product-link')
@bindings()
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging
export class AtomicProductLink
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = styles;

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
  public interactiveProductController = createInteractiveProductContextController(this);

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;

  @state() private linkAttributes?: Attr[];
  private stopPropagation?: boolean;
  private removeLinkEventHandlers?: () => void;
  private anchorRef = createRef<HTMLAnchorElement>();

  private logWarningIfNeeded(warning?: string) {
    if (warning) {
      this.bindings.engine.logger.warn(warning);
    }
  }

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
    if (!this.interactiveProduct && this.interactiveProductController.interactiveItem) {
      this.interactiveProduct = this.interactiveProductController.interactiveItem;
    }

    this.dispatchEvent(
      buildCustomEvent('atomic/resolveStopPropagation', (stopPropagation: boolean) => {
        this.stopPropagation = stopPropagation;
      })
    );
  }

  /**
   * Clicks the rendered link, the same way a user would. This logs the product click and opens the link's `href`.
   *
   * Use this method rather than querying the `a` element rendered by the component, whose markup may change.
   *
   * Does nothing if the link isn't rendered yet.
   *
   * @param options - The click options.
   * @param options.newTab - Whether to open the link in a new tab, as with a Ctrl or Cmd click. The link's `target` is set to `_blank` for this click only.
   */
  public clickLink(options?: {newTab?: boolean}): void {
    clickItemLink(this.anchorRef.value, options);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.removeLinkEventHandlers) {
      this.removeLinkEventHandlers();
      this.removeLinkEventHandlers = undefined;
    }
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    this.linkAttributes = getAttributesFromLinkSlotContent(this, 'attributes');
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.product && this.interactiveProduct, () => {
      const product = this.product!;
      const interactiveProduct = this.interactiveProduct!;

      const href = isUndefined(this.hrefTemplate)
        ? product.clickUri
        : buildStringTemplateFromProduct(this.hrefTemplate, product, this.bindings);

      const {warningMessage} = interactiveProduct;

      return renderLinkWithItemAnalytics({
        props: {
          href,
          ref: this.anchorRef,
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
          html`<atomic-product-text field="ec_name" default="no-title"></atomic-product-text>`
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
