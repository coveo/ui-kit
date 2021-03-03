import {Component, Prop, Element, h, Host} from '@stencil/core';
import {Result, ResultTemplatesHelpers, HighlightUtils} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import dayjs from 'dayjs';
import {
  Bindings,
  InitializeBindings,
} from '../../../utils/initialization-utils';

export type ResultValueFormat = 'text' | 'date' | 'number' | 'currency';

/**
 * The ResultValue component renders the value of a result property.
 */
@Component({
  tag: 'atomic-result-value',
  shadow: false,
})
export class AtomicResultValue {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  public error!: Error;

  @Element() host!: HTMLElement;

  /**
   * Which result value should the component render
   */
  @Prop() value!: string;
  /**
   * Which highlight should the value be highlighted with.
   * Possible values are `firstSentencesHighlights`, `excerptHighlights`, `printableUriHighlights` or `summaryHighlights`.
   *
   */
  @Prop() shouldHighlightWith?: string;
  /**
   * The format in which to display the result value.
   * Possible values are `text`, `date`, `number` or `currency`.
   */
  @Prop() format: ResultValueFormat = 'text';
  /**
   * When the `format` is `date`, defines the format of the date itself.
   * Available formats: https://day.js.org/docs/en/display/format
   */
  @Prop() dateFormat = 'D/M/YYYY';
  /**
   * When the `format` is `number`, allows to define the number of digits.
   */
  @Prop() numberOfDigits?: number;
  /**
   * When the `format` is `currency`, allows to define which currency to display.
   */
  @Prop() currency = 'USD';

  private get resultValue() {
    return ResultTemplatesHelpers.getResultProperty(this.result, this.value);
  }

  private renderWithHighlights() {
    try {
      const highlights = ResultTemplatesHelpers.getResultProperty(
        this.result,
        this.shouldHighlightWith!
      ) as HighlightUtils.HighlightKeyword[];

      const highlightedValue = HighlightUtils.highlightString({
        content: `${this.resultValue}`,
        openingDelimiter: '<strong>',
        closingDelimiter: '</strong>',
        highlights,
      });
      return <Host innerHTML={highlightedValue}></Host>;
    } catch (error) {
      return (
        <atomic-component-error
          element={this.host}
          error={error}
        ></atomic-component-error>
      );
    }
  }

  private renderDate() {
    return dayjs(parseInt(`${this.resultValue}`)).format(this.dateFormat);
  }

  private renderNumber() {
    return parseInt(`${this.resultValue}`).toLocaleString(
      this.bindings.i18n.languages,
      this.numberOfDigits !== undefined
        ? {
            minimumFractionDigits: this.numberOfDigits,
            maximumFractionDigits: this.numberOfDigits,
          }
        : {}
    );
  }

  private renderCurrency() {
    return parseInt(`${this.resultValue}`).toLocaleString(
      this.bindings.i18n.languages,
      {
        style: 'currency',
        currency: this.currency,
      }
    );
  }

  public render() {
    if (this.resultValue === null) {
      this.host.remove();
      return;
    }

    if (this.format === 'date') {
      return this.renderDate();
    }

    if (this.format === 'number') {
      return this.renderNumber();
    }

    if (this.format === 'currency') {
      return this.renderCurrency();
    }

    if (this.shouldHighlightWith) {
      return this.renderWithHighlights();
    }

    return this.resultValue;
  }
}
