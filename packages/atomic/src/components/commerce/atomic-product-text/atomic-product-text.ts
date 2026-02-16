import {
  HighlightUtils,
  type Product,
  ProductTemplatesHelpers,
} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import {renderItemTextFallback} from '@/src/components/common/item-text/item-text-fallback';
import {renderItemTextHighlighted} from '@/src/components/common/item-text/item-text-highlighted';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import '../atomic-commerce-text/atomic-commerce-text';
import {getStringValueFromProductOrNull} from '@/src/components/commerce/product-template-component-utils/product-utils';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-product-text` component renders the value of a string field for a given product.
 */
@customElement('atomic-product-text')
@bindings()
export class AtomicProductText
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The string field whose value the component should render.
   * The component will look for the specified field in the product's properties first, and then in the product's `additionalFields` property.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * Whether to highlight the string field value.
   * @deprecated - replaced by `no-highlight` (this defaults to `true`, while the replacement is the inverse and defaults to `false`).
   * Only works if the `field` property is set to `excerpt` or `ec_name`.
   */
  @property({
    type: Boolean,
    attribute: 'should-highlight',
    reflect: true,
    converter: booleanConverter,
  })
  public shouldHighlight = true;

  /**
   * Disable highlighting of the string field value.
   * Only works if the `field` property is set to `excerpt` or `ec_name`.
   */
  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
    attribute: 'no-highlight',
  })
  public disableHighlight: boolean = false;
  /**
   * The locale key to use for displaying default text when the specified field has no value for the product.
   */
  @property({type: String, reflect: true}) public default?: string;

  @state() private product!: Product;

  private productController = createProductContextController(this);

  @state() public bindings!: CommerceBindings;

  @state() public error!: Error;

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${when(
        this.product && this.field,
        () => this.renderProductTextValue(),
        () => nothing
      )}
    `;
  }

  private get shouldRenderHighlights(): boolean {
    return (
      !this.disableHighlight &&
      this.shouldHighlight &&
      this.isFieldSupportedForHighlighting()
    );
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
    if (!this.default) {
      return nothing;
    }

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
            onError: (error: Error) => {
              this.error = error;
            },
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
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-text': AtomicProductText;
  }
}
