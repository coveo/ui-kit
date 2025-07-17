import type {Product} from '@coveo/headless/commerce';
import {html, LitElement, nothing, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {
  defaultNumberFormatter,
  type NumberFormatter,
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

  @state() private _product!: Product;

  get product(): Product {
    // Give priority to directly set product over controller
    return this._product || this.productController.item;
  }

  set product(value: Product) {
    if (this._product !== value) {
      this._product = value;
      this.updateValueToDisplay();
      this.requestUpdate();
    }
  }
  @state() private formatter: NumberFormatter = defaultNumberFormatter;
  @state() private valueToDisplay: string | null = null;

  private productController = createProductContextController(this);

  @state() public bindings!: CommerceBindings;

  @state() public error!: Error;

  protected createRenderRoot() {
    return this;
  }

  private handleNumberFormatEvent = (event: CustomEvent<NumberFormatter>) => {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
    this.updateValueToDisplay();
    this.requestUpdate();
  };

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/numberFormat',
      this.handleNumberFormatEvent as EventListener
    );

    // Add hydrated class for compatibility with Stencil-based test infrastructure
    this.classList.add('hydrated');
  }

  disconnectedCallback() {
    this.removeEventListener(
      'atomic/numberFormat',
      this.handleNumberFormatEvent as EventListener
    );
    super.disconnectedCallback();
  }

  initialize() {
    this.updateProductFromController();
    this.updateValueToDisplay();
  }

  private formatValue(value: number): string {
    try {
      const languages = this.bindings?.i18n?.languages || ['en'];
      return this.formatter(value, [...languages]);
    } catch (error) {
      // Don't set this.error for formatting errors - they should not prevent rendering
      return value.toString();
    }
  }

  private updateValueToDisplay() {
    if (!this.product || !this.field) {
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

  private updateProductFromController() {
    // Only update from controller if no product has been set directly
    if (!this._product && this.productController.item) {
      this._product = this.productController.item;
    }
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    this.updateProductFromController();

    // Update value display when relevant properties change
    if (
      changedProperties.has('field') ||
      changedProperties.has('_product') ||
      changedProperties.has('formatter')
    ) {
      this.updateValueToDisplay();
    }
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
