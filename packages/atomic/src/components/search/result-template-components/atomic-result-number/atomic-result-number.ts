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
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-result-number` component renders the value of a number result field.
 *
 * @slot default - The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@customElement('atomic-result-number')
@bindings()
export class AtomicResultNumber
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  /**
   * The field that the component should use.
   * The component will try to find this field in the `Result.raw` object unless it finds it in the `Result` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-search-interface` component.
   */
  @property({reflect: true}) field!: string;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @state() private formatter: NumberFormatter = defaultNumberFormatter;
  @state() private valueToDisplay: string | null = null;

  private resultContext = createResultContextController(this);
  private get result(): Result {
    return this.resultContext.item as Result;
  }

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

  willUpdate() {
    this.updateValueToDisplay();

    if (this.valueToDisplay === null) {
      this.remove();
    }
  }

  render() {
    return html`${this.valueToDisplay}`;
  }

  private handleNumberFormat = (event: Event) => {
    const customEvent = event as CustomEvent<NumberFormatter>;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    this.formatter = customEvent.detail;
  };

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
      this.error = new Error(
        `Could not parse "${value}" from field "${this.field}" as a number.`
      );
      return null;
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

  private updateValueToDisplay() {
    const value = this.parseValue();
    if (value !== null) {
      this.valueToDisplay = this.formatValue(value);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-number': AtomicResultNumber;
  }
}
