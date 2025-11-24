import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {LightDomMixin} from '@/src/mixins/light-dom.js';
import {
  formatCurrency,
  formatNumber,
  formatUnit,
} from '@/src/utils/number-format-utils';
import {
  defaultNumberFormatter,
  type NumberFormatter,
} from '../../common/formats/format-common.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import {parseValue} from '../product-template-component-utils/product-utils.js';

/**
 * The `atomic-product-numeric-field-value` component renders the value of a number product field.
 *
 * The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component (deprecated - use format properties instead).
 */
@customElement('atomic-product-numeric-field-value')
@bindings()
export class AtomicProductNumericFieldValue
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state() error!: Error;

  private productController = createProductContextController(this);

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Product.additionalFields` object unless it finds it in the `Product` object first.
   */
  @property({reflect: true}) field!: string;

  /**
   * The currency to use in currency formatting.
   * Possible values are the ISO 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB.
   */
  @property({reflect: true}) public currency?: string;

  /**
   * The minimum number of integer digits to use.
   */
  @property({type: Number, reflect: true, attribute: 'minimum-integer-digits'})
  public minimumIntegerDigits?: number;

  /**
   * The minimum number of fraction digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'minimum-fraction-digits',
  })
  public minimumFractionDigits?: number;

  /**
   * The maximum number of fraction digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'maximum-fraction-digits',
  })
  public maximumFractionDigits?: number;

  /**
   * The minimum number of significant digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'minimum-significant-digits',
  })
  public minimumSignificantDigits?: number;

  /**
   * The maximum number of significant digits to use.
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'maximum-significant-digits',
  })
  public maximumSignificantDigits?: number;

  /**
   * The unit to use in unit formatting.
   * Must be a sanctioned unit identifier.
   */
  @property({reflect: true}) public unit?: string;

  /**
   * The unit formatting style to use.
   * - "long" (for example, 16 litres)
   * - "short" (for example, 16 l)
   * - "narrow" (for example, 16l)
   */
  @property({reflect: true, attribute: 'unit-display'})
  public unitDisplay?: 'long' | 'short' | 'narrow';

  @state() private formatterFromSlot: NumberFormatter = defaultNumberFormatter;
  @state() private hasSlottedFormatter = false;

  initialize() {
    this.addEventListener(
      'atomic/numberFormat',
      this.setFormat as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/numberFormat',
      this.setFormat as EventListener
    );
  }

  private setFormat = (event: Event) => {
    const customEvent = event as CustomEvent<NumberFormatter>;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    this.formatterFromSlot = customEvent.detail;
    this.hasSlottedFormatter = true;

    // Show deprecation warning if using slotted formatter
    console.warn(
      'Using atomic-format-* components inside atomic-product-numeric-field-value is deprecated. ' +
        'Please use the format properties (currency, unit, minimumFractionDigits, etc.) directly on atomic-product-numeric-field-value instead.'
    );
  };

  private get formatter(): NumberFormatter {
    // Prioritize own props over slotted formatter
    if (this.currency !== undefined) {
      return (value, languages) =>
        formatCurrency(value, languages, {
          currency: this.currency!,
          minimumIntegerDigits: this.minimumIntegerDigits,
          minimumFractionDigits: this.minimumFractionDigits,
          maximumFractionDigits: this.maximumFractionDigits,
          minimumSignificantDigits: this.minimumSignificantDigits,
          maximumSignificantDigits: this.maximumSignificantDigits,
        });
    }

    if (this.unit !== undefined) {
      return (value, languages) =>
        formatUnit(value, languages, {
          unit: this.unit!,
          unitDisplay: this.unitDisplay,
          minimumIntegerDigits: this.minimumIntegerDigits,
          minimumFractionDigits: this.minimumFractionDigits,
          maximumFractionDigits: this.maximumFractionDigits,
          minimumSignificantDigits: this.minimumSignificantDigits,
          maximumSignificantDigits: this.maximumSignificantDigits,
        });
    }

    if (
      this.minimumIntegerDigits !== undefined ||
      this.minimumFractionDigits !== undefined ||
      this.maximumFractionDigits !== undefined ||
      this.minimumSignificantDigits !== undefined ||
      this.maximumSignificantDigits !== undefined
    ) {
      return (value, languages) =>
        formatNumber(value, languages, {
          minimumIntegerDigits: this.minimumIntegerDigits,
          minimumFractionDigits: this.minimumFractionDigits,
          maximumFractionDigits: this.maximumFractionDigits,
          minimumSignificantDigits: this.minimumSignificantDigits,
          maximumSignificantDigits: this.maximumSignificantDigits,
        });
    }

    // Fall back to slotted formatter if no props are set
    if (this.hasSlottedFormatter) {
      return this.formatterFromSlot;
    }

    // Default formatter
    return defaultNumberFormatter;
  }

  private get value() {
    const product = this.productController.item;

    if (!product) {
      return null;
    }
    const value = parseValue(product, this.field);
    if (value === null) {
      return null;
    }
    return this.formatter(value, this.bindings.i18n.languages as string[]);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${when(this.value !== null, () => html`${this.value}`)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-numeric-field-value': AtomicProductNumericFieldValue;
  }
}
