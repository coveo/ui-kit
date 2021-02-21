import {Component, Prop, Element, h, Host} from '@stencil/core';
import {Result, ResultTemplatesHelpers, HighlightUtils} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

/**
 * The ResultValue component renders the value of a result property.
 */
@Component({
  tag: 'atomic-result-value',
  shadow: false,
})
export class AtomicResultValue {
  @ResultContext() private result!: Result;

  @Element() host!: HTMLDivElement;

  /**
   * Which result value should the component render
   */
  @Prop() value!: string;
  /**
   * Which highlight should the value be highlighted with
   */
  @Prop() shouldHighlightWith?: string;

  private get resultValue() {
    return `${ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.value
    )}`;
  }

  private renderWithHighlights() {
    try {
      const highlights = ResultTemplatesHelpers.getResultProperty(
        this.result,
        this.shouldHighlightWith!
      ) as HighlightUtils.HighlightKeyword[];

      const highlightedValue = HighlightUtils.highlightString({
        content: this.resultValue,
        openingDelimiter: '<strong>',
        closingDelimiter: '</strong>',
        highlights,
      });
      return <Host class="block" innerHTML={highlightedValue}></Host>;
    } catch (error) {
      return (
        <atomic-component-error
          element={this.host}
          error={error}
        ></atomic-component-error>
      );
    }
  }

  @ResultContextRenderer
  public render() {
    if (this.resultValue === null) {
      this.host.remove();
      return;
    }

    if (this.shouldHighlightWith) {
      return this.renderWithHighlights();
    }

    return <Host class="block">{this.resultValue}</Host>;
  }
}
