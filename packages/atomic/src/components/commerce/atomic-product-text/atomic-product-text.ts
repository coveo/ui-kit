import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {Product} from '@coveo/headless/commerce';
import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getFieldValueCaption} from '../../../utils/field-utils';
import '../../common/item-text/item-text-fallback.js';
import '../../common/item-text/item-text-highlighted.js';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-text/atomic-commerce-text';
import {getStringValueFromProductOrNull} from '../product-template-component-utils/product-utils.js';

/**
 * The `atomic-product-text` component renders the value of a string field for a given product.
 */
@bindings()
@customElement('atomic-product-text')
export class AtomicProductText
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The string field whose value the component should render.
   * The component will look for the specified field in the product's properties first, and then in the product's `additionalFields` property.
   */
  @property({type: String, reflect: true}) field = '';
  /**
   * Whether to highlight the string field value.
   *
   * Only works if the `field` property is set to `excerpt` or `ec_name`.
   */
  @property({type: Boolean, attribute: 'should-highlight', reflect: true})
  shouldHighlight = true;
  /**
   * The locale key to use for displaying default text when the specified field has no value for the product.
   */
  @property({type: String, reflect: true}) default = '';

  @state() private product!: Product;

  private productController = createProductContextController(this);

  @state() bindings!: CommerceBindings;

  @state() error!: Error;

  initialize = () => {};

  private get textValue(): string {
    const productValueAsString = getStringValueFromProductOrNull(
      this.product,
      this.field
    );

    return productValueAsString !== null
      ? `${productValueAsString}`
      : this.default;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }

    return html`
      ${when(
        this.product,
        () => html`
          <atomic-commerce-text
            .value=${getFieldValueCaption(
              this.field,
              this.textValue,
              this.bindings.i18n
            )}
          ></atomic-commerce-text>
        `,
        () => nothing
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-text': AtomicProductText;
  }
}
