import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, Element, State, Listen} from '@stencil/core';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../../common/formats/format-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-number` component renders the value of a number result field.
 *
 * @slot default - The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@Component({
  tag: 'atomic-result-number',
  shadow: false,
})
export class AtomicResultNumber {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Result.raw` object unless it finds it in the `Result` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-search-interface` component.
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
