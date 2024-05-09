import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {Component, Prop, Element, State, Listen} from '@stencil/core';
import {Bindings} from '../../../../components';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../../common/formats/format-common';
import {ProductContext} from '../product-template-decorators';

/**
 * @internal
 * The `atomic-product-numeric-field-value` component renders the value of a number product field.
 *
 * The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@Component({
  tag: 'atomic-product-numeric-field-value',
  shadow: false,
})
export class AtomicProductNumber {
  @InitializeBindings() public bindings!: Bindings;
  @ProductContext() private product!: Product;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Product.additionalFields` object unless it finds it in the `Product` object first.
   */
  @Prop({reflect: true}) field!: string;

  @State() formatter: NumberFormatter = defaultNumberFormatter;

  @State() valueToDisplay: string | null = null;

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  private parseValue() {
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field
    );
    if (value === null) {
      return null;
    }
    const valueAsNumber = parseFloat(`${value}`);
    if (Number.isNaN(valueAsNumber)) {
      this.error = new Error(
        `Could not parse "${value}" from field "${this.field}" as a number.`
      );
      return null;
    }
    return valueAsNumber;
  }

  private formatValue(value: number) {
    try {
      return this.formatter(value, this.bindings.i18n.languages as string[]);
    } catch (error) {
      this.error = error as Error;
      return value.toString();
    }
  }

  private updateValueToDisplay() {
    const value = this.parseValue();
    if (value !== null) {
      this.valueToDisplay = this.formatValue(value);
    }
  }

  componentWillRender() {
    this.updateValueToDisplay();
  }

  public render() {
    if (this.valueToDisplay === null) {
      this.host.remove();
      return;
    }
    return this.valueToDisplay;
  }
}
