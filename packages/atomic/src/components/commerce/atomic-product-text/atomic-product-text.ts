import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {
  Product,
  ProductTemplatesHelpers,
  HighlightUtils,
} from '@coveo/headless/commerce';
import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {renderItemTextFallback} from '../../common/item-text/item-text-fallback.js';
import {renderItemTextHighlighted} from '../../common/item-text/item-text-highlighted.js';
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

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
  }

  private get shouldRenderHighlights(): boolean {
    return this.shouldHighlight && this.isFieldSupportedForHighlighting();
  }

  private isFieldSupportedForHighlighting(): boolean {
    return ['ec_name', 'excerpt'].includes(this.field);
  }

  private get highlightKeywords(): HighlightUtils.HighlightKeyword[] | null {
    if (!this.shouldRenderHighlights) {
      return null;
    }

    return ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field === 'ec_name' ? 'nameHighlights' : 'excerptHighlights'
    ) as HighlightUtils.HighlightKeyword[];
  }

  private renderFallback() {
    return renderItemTextFallback({
      props: {
        field: this.field,
        host: this,
        logger: this.bindings.engine.logger,
        defaultValue: this.default,
        item: this.product,
        getProperty: (result: unknown, property: string) =>
          ProductTemplatesHelpers.getProductProperty(
            result as Product,
            property
          ),
      },
    })(html`
      <atomic-commerce-text
        .value=${getFieldValueCaption(
          this.field,
          this.default!,
          this.bindings.i18n
        )}
      ></atomic-commerce-text>
    `);
  }

  private renderProductText(textValue: string) {
    const highlightKeywords = this.highlightKeywords;

    return this.shouldRenderHighlights &&
      highlightKeywords &&
      highlightKeywords.length > 0
      ? renderItemTextHighlighted({
          props: {
            textValue,
            highlightKeywords,
            highlightString: HighlightUtils.highlightString,
            onError: (error: Error) => (this.error = error),
          },
        })
      : html`
          <atomic-commerce-text
            .value=${getFieldValueCaption(
              this.field,
              textValue,
              this.bindings.i18n
            )}
          ></atomic-commerce-text>
        `;
  }

  private renderProductTextValue() {
    const productValueAsString = getStringValueFromProductOrNull(
      this.product,
      this.field
    );

    if (productValueAsString === null) {
      return this.renderFallback();
    }

    return this.renderProductText(`${productValueAsString}`);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${when(
        this.product,
        () => this.renderProductTextValue(),
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
