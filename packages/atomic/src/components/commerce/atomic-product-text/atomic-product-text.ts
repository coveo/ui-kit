import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {Product} from '@coveo/headless/commerce';
import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {getFieldValueCaption} from '../../../utils/field-utils';
import '../../common/item-text/item-text-fallback.js';
import '../../common/item-text/item-text-highlighted.js';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-text/atomic-commerce-text';
import {getStringValueFromProductOrNull} from '../product-template-component-utils/product-utils.js';

/**
 * The `atomic-product-text` component renders the value of a string product field.
 */
@bindings()
@customElement('atomic-product-text')
export class AtomicProductText
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The product field which the component should use.
   * This will look in the Product object first, and then in the product.additionalFields object for the fields.
   */
  @property({type: String, reflect: true}) field = '';
  /**
   * When this is set to `true`, the component attempts to highlight text based on the highlighting properties provided by the search API response.
   * This property only works for the product excerpt and the ec_name field.
   */
  @property({type: Boolean, attribute: 'should-highlight', reflect: true})
  shouldHighlight = true;
  /**
   * The locale key for the text to display when the configured field has no value.
   */
  @property({type: String, reflect: true}) default = '';

  /**
   * The product object to render from. Must be set by the parent.
   */
  @property({type: Object}) product!: Product;

  private productController = createProductContextController(this);

  @state() bindings!: CommerceBindings;

  @state() error!: Error;

  initialize = () => {};

  @bindingGuard()
  @errorGuard()
  render() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }

    if (!this.product) {
      return html`${nothing}`;
    }

    return html`
      ${(() => {
        const productValueAsString = getStringValueFromProductOrNull(
          this.product,
          this.field
        );

        if (productValueAsString === null) {
          return html`
            <atomic-commerce-text
              .value=${getFieldValueCaption(
                this.field,
                this.default,
                this.bindings.i18n
              )}
            ></atomic-commerce-text>
          `;
        }

        const textValue = `${productValueAsString}`;
        return html`
          <atomic-commerce-text
            .value=${getFieldValueCaption(
              this.field,
              textValue,
              this.bindings.i18n
            )}
          ></atomic-commerce-text>
        `;
      })()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-text': AtomicProductText;
  }
}
