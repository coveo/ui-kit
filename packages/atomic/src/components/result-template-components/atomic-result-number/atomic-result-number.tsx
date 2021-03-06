import {Component, Prop, Element, State} from '@stencil/core';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';

/**
 * The ResultNumber component renders the value of a number result field.
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
   * The result field which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() field!: string;
  /**
   * The minimum number of integer digits to use.
   */
  @Prop() minimumIntegerDigits?: number;
  /**
   * The minimum number of fraction digits to use.
   */
  @Prop() minimumFractionDigits?: number;
  /**
   * The maximum number of fraction digits to use.
   */
  @Prop() maximumFractionDigits?: number;
  /**
   * The minimum number of significant digits to use.
   */
  @Prop() minimumSignificantDigits?: number;
  /**
   * The maximum number of significant digits to use.
   */
  @Prop() maximumSignificantDigits?: number;

  public render() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (value === null) {
      this.host.remove();
      return;
    }

    return parseFloat(`${value}`).toLocaleString(this.bindings.i18n.languages, {
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits,
    });
  }
}
