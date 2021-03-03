import {Component, Prop, h, Element, Host, State} from '@stencil/core';
import {HighlightUtils, Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';

/**
 * The ResultTextValue component renders the value of a string result property.
 * @part result-text-highlight - The highlighted elements from the text value.
 */
@Component({
  tag: 'atomic-result-text-value',
  shadow: false,
})
export class AtomicResultTextValue {
  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  @State() private error?: Error;

  /**
   * The result property which the component should use.
   * Will look in the Result object first and then in the Result.raw object for the fields.
   * It is important to include the necessary fields in the ResultList component.
   */
  @Prop() public property!: string;
  /**
   * If true, will look for the corresponding highlight property use it if available.
   */
  @Prop() public shouldHighlight = true;

  private renderWithHighlights(
    value: string,
    highlights: HighlightUtils.HighlightKeyword[]
  ) {
    try {
      const highlightedValue = HighlightUtils.highlightString({
        content: value,
        openingDelimiter: '<b part="result-text-highlight">',
        closingDelimiter: '</b>',
        highlights,
      });
      return <Host innerHTML={highlightedValue}></Host>;
    } catch (error) {
      this.error = error;
    }
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.property
    );

    if (value === null) {
      this.host.remove();
      return;
    }

    const textValue = `${value}`;
    const highlightsValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      `${this.property}Highlights`
    ) as HighlightUtils.HighlightKeyword[];

    if (this.shouldHighlight && highlightsValue !== null) {
      return this.renderWithHighlights(textValue, highlightsValue);
    }

    return textValue;
  }
}
