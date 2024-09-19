import {
  Product,
  ProductTemplatesHelpers,
  HighlightUtils,
} from '@coveo/headless/commerce';
import {Component, h, Prop, Element, State} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {ItemTextFallback} from '../../../common/item-text/item-text-fallback';
import {ItemTextHighlighted} from '../../../common/item-text/item-text-highlighted';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';
import {getStringValueFromProductOrNull} from '../product-utils';

/**
 * @alpha
 * The `atomic-product-text` component renders the value of a string product field.
 */
@Component({
  tag: 'atomic-product-text',
  shadow: false,
})
export class AtomicProductText
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  @State() public error!: Error;

  @ProductContext() private product!: Product;

  @Element() private host!: HTMLElement;

  /**
   * The product field which the component should use.
   * This will look in the Product object first, and then in the product.additionalFields object for the fields.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * When this is set to `true`, the component attempts to highlight text based on the highlighting properties provided by the search API response.
   * This property only works for the product excerpt and the ec_name field.
   */
  @Prop({reflect: true}) public shouldHighlight = true;
  /**
   * The locale key for the text to display when the configured field has no value.
   */
  @Prop({reflect: true}) public default?: string;

  private get shouldRenderHighlights() {
    return this.shouldHighlight && this.isFieldSupportedForHighlighting();
  }

  public isFieldSupportedForHighlighting() {
    return ['ec_name', 'excerpt'].includes(this.field);
  }

  public render() {
    const productValueAsString = getStringValueFromProductOrNull(
      this.product,
      this.field
    );

    if (productValueAsString === null) {
      return (
        <ItemTextFallback
          field={this.field}
          host={this.host}
          logger={this.bindings.engine.logger}
          defaultValue={this.default}
          item={this.product}
          getProperty={ProductTemplatesHelpers.getProductProperty}
        >
          <atomic-commerce-text
            value={getFieldValueCaption(
              this.field,
              this.default!,
              this.bindings.i18n
            )}
          ></atomic-commerce-text>
        </ItemTextFallback>
      );
    }

    const textValue = `${productValueAsString}`;
    const highlightKeywords = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field === 'ec_name' ? 'nameHighlights' : 'excerptHighlights'
    ) as HighlightUtils.HighlightKeyword[];

    return this.shouldRenderHighlights && highlightKeywords ? (
      <ItemTextHighlighted
        textValue={textValue}
        highlightKeywords={highlightKeywords}
        highlightString={HighlightUtils.highlightString}
        onError={(error) => (this.error = error)}
      ></ItemTextHighlighted>
    ) : (
      <atomic-commerce-text
        value={getFieldValueCaption(this.field, textValue, this.bindings.i18n)}
      ></atomic-commerce-text>
    );
  }
}
