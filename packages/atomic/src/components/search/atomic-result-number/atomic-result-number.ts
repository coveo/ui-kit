import {Schema, StringValue} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  defaultNumberFormatter,
  type NumberFormatter,
} from '@/src/components/common/formats/format-common';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {
  formatCurrency,
  formatNumber,
  formatUnit,
} from '@/src/utils/number-format-utils';

/**
 * The `atomic-result-number` component renders the value of a numeric result field.
 * You can embed an `atomic-format-number`, `atomic-format-currency`, or `atomic-format-unit` component inside this component to format its value (deprecated - use format properties instead).
 */
@customElement('atomic-result-number')
@bindings()
export class AtomicResultNumber
  extends LightDomMixin(InitializeBindingsMixin(LitElement))
  implements InitializableComponent<Bindings>
{
  /**
   * The name of the numeric result field whose value to display.
   * The component looks for this field in the `Result` object, then in `Result.raw` if not found.
   * This field must be present in the `fieldsToInclude` property of the `atomic-search-interface` component.
   */
  @property({reflect: true}) public field!: string;

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

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @state() private formatterFromSlot: NumberFormatter = defaultNumberFormatter;
  @state() private hasSlottedFormatter = false;

  private resultContext = createResultContextController(this);

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({field: this.field}),
      new Schema({
        field: new StringValue({
          emptyAllowed: false,
          required: true,
        }),
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('atomic/numberFormat', this.handleNumberFormat);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('atomic/numberFormat', this.handleNumberFormat);
  }

  public initialize() {}

  @bindingGuard()
  @errorGuard()
  render() {
    const valueToDisplay = this.getValueToDisplay();
    if (valueToDisplay === null) {
      this.remove();
      return html``;
    }
    return html`${valueToDisplay}`;
  }

  private handleNumberFormat = (event: Event) => {
    const customEvent = event as CustomEvent<NumberFormatter>;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    this.formatterFromSlot = customEvent.detail;
    this.hasSlottedFormatter = true;

    // Show deprecation warning if using slotted formatter
    console.warn(
      'Using atomic-format-* components inside atomic-result-number is deprecated. ' +
        'Please use the format properties (currency, unit, minimumFractionDigits, etc.) directly on atomic-result-number instead.'
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

  private parseValue(): number | null {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    if (value === null) {
      return null;
    }

    const valueAsNumber = parseFloat(`${value}`);
    if (Number.isNaN(valueAsNumber)) {
      throw new Error(
        `Could not parse "${value}" from field "${this.field}" as a number.`
      );
    }
    return valueAsNumber;
  }

  private formatValue(value: number): string {
    try {
      return this.formatter(value, this.bindings.i18n.languages as string[]);
    } catch (error) {
      this.error = error as Error;
      return value.toString();
    }
  }

  private getValueToDisplay(): string | null | undefined {
    try {
      const value = this.parseValue();
      if (value === null) {
        return null;
      }
      return this.formatValue(value);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private get result(): Result {
    return this.resultContext.item as Result;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-number': AtomicResultNumber;
  }
}
