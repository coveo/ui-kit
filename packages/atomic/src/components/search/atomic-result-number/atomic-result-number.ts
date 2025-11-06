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

/**
 * The `atomic-result-number` component renders the value of a numeric result field.
 * You can embed an `atomic-format-number`, `atomic-format-currency`, or `atomic-format-unit` component inside this component to format its value.
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

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @state() private formatter: NumberFormatter = defaultNumberFormatter;

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
