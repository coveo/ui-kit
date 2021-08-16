import {Component, Prop, Element, State, Listen} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../../result-template-components/result-template-decorators';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  defaultNumberFormatter,
  NumberFormatter,
} from '../../formats/format-common';

/**
 * The `atomic-result-number` component renders the value of a number result field.
 *
 * The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@Component({
  tag: 'atomic-result-number-v1',
  shadow: false,
})
export class AtomicResultNumber {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look for the fields in the Result object first, and then in the Result.raw object.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop() field!: string;

  @State() formatter: NumberFormatter = defaultNumberFormatter;

  @Listen('atomic/numberFormat')
  public setFormat(event: CustomEvent<NumberFormatter>) {
    event.preventDefault();
    event.stopPropagation();
    this.formatter = event.detail;
  }

  private get value() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    if (value === null) {
      return null;
    }
    const valueAsNumber = parseFloat(`${value}`);
    return Number.isNaN(valueAsNumber) ? null : valueAsNumber;
  }

  private formatValue(value: number) {
    try {
      return this.formatter(value, this.bindings.i18n.languages);
    } catch (error) {
      this.error = new Error(
        `atomic-result-number value "${value}" could not be formatted correctly.`
      );
      return value;
    }
  }

  public render() {
    const value = this.value;

    if (value === null) {
      return;
    }

    return this.formatValue(value);
  }
}
