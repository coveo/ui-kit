import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {Component, h, Prop, Element} from '@stencil/core';
import {isArray} from 'lodash';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {CommerceBindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';
import {getStringValueFromProductOrNull} from '../product-utils';

/**
 * @internal
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
  public error!: Error;

  @ProductContext() private product!: Product;

  @Element() private host!: HTMLElement;

  /**
   * The product field which the component should use.
   * This will look in the Product object first, and then in the product.additionalFields object for the fields.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * The locale key for the text to display when the configured field has no value.
   */
  @Prop({reflect: true}) public default?: string;

  private possiblyWarnOnBadFieldType() {
    const productValueRaw = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field
    );
    if (isArray(productValueRaw)) {
      this.bindings.engine.logger.error(
        `atomic-product-text cannot be used with multi value field "${this.field}" with values "${productValueRaw}".`,
        this
      );
    }
  }

  public render() {
    const productValueAsString = getStringValueFromProductOrNull(
      this.product,
      this.field
    );

    if (!productValueAsString && !this.default) {
      this.possiblyWarnOnBadFieldType();
      this.host.remove();
      return;
    }

    if (!productValueAsString && this.default) {
      this.possiblyWarnOnBadFieldType();
      return (
        <atomic-commerce-text
          value={getFieldValueCaption(
            this.field,
            productValueAsString ?? this.default,
            this.bindings.i18n
          )}
        ></atomic-commerce-text>
      );
    }

    if (productValueAsString !== null) {
      this.possiblyWarnOnBadFieldType();
      return (
        <atomic-commerce-text
          value={getFieldValueCaption(
            this.field,
            productValueAsString,
            this.bindings.i18n
          )}
        ></atomic-commerce-text>
      );
    }
  }
}
