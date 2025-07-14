import {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../common/formats/format-common';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {parseValue} from '../product-template-component-utils/product-utils.js';

/**
 * @alpha
 * The `atomic-product-numeric-field-value` component renders the value of a number product field.
 *
 * The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@customElement('atomic-product-numeric-field-value')
@bindings()
export class AtomicProductNumericFieldValue
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  /**
   * The field that the component should use.
   * The component will try to find this field in the `Product.additionalFields` object unless it finds it in the `Product` object first.
   */
  @property({type: String, reflect: true}) public field!: string;

  @state() private product!: Product;
  @state() private formatter: NumberFormatter = defaultNumberFormatter;
  @state() private valueToDisplay: string | null = null;

  private productController = createProductContextController(this);

  @state() public bindings!: CommerceBindings;

  @state() public error!: Error;

  protected createRenderRoot() {
    return this;
  }

  private handleNumberFormatEvent = (event: Event) => {
    const customEvent = event as CustomEvent<NumberFormatter>;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    this.formatter = customEvent.detail;
    this.updateValueToDisplay();
  };

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('atomic/numberFormat', this.handleNumberFormatEvent);
  }

  disconnectedCallback() {
    this.removeEventListener('atomic/numberFormat', this.handleNumberFormatEvent);
    super.disconnectedCallback();
  }

  initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
  }

  private formatValue(value: number): string {
    try {
      return this.formatter(value, this.bindings.i18n.languages as string[]);
    } catch (error) {
      this.error = error as Error;
      return value.toString();
    }
  }

  private updateValueToDisplay() {
    if (!this.product) {
      this.valueToDisplay = null;
      return;
    }

    try {
      const value = parseValue(this.product, this.field);
      if (value !== null) {
        this.valueToDisplay = this.formatValue(value);
      } else {
        this.valueToDisplay = null;
      }
    } catch (error) {
      this.error = error as Error;
      this.valueToDisplay = null;
    }
  }

  protected willUpdate(): void {
    if (this.productController.item) {
      this.product = this.productController.item;
    }
    this.updateValueToDisplay();
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      ${when(
        this.valueToDisplay !== null,
        () => html`${this.valueToDisplay}`,
        () => nothing
      )}
    `;
  }
}