import {Component, Prop, h, Element, Host, State} from '@stencil/core';
import {HighlightUtils, Result, ResultTemplatesHelpers} from '@coveo/headless';
import {ResultContext} from '../result-template-decorators';
import escape from 'escape-html';

/**
 * The `atomic-result-text` component renders the value of a string result field.
 * @part result-text-highlight - The highlighted elements from the text.
 */
@Component({
  tag: 'atomic-result-text',
  shadow: false,
})
export class AtomicResultText {
  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  @State() private error?: Error;

  /**
   * The result field which the component should use.
   * This will look in the Result object first, and then in the Result.raw object for the fields.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop() public field!: string;
  /**
   * If this is set to true, it will look for the corresponding highlight property and use it if available.
   */
  @Prop() public shouldHighlight = true;

  /**
   * The locale key for the text to display when the configured field has no value.
   */
  @Prop() public default?: string;

  private renderWithHighlights(
    value: string,
    highlights: HighlightUtils.HighlightKeyword[]
  ) {
    try {
      const openingDelimiter = '_openingDelimiter_';
      const closingDelimiter = '_closingDelimiter_';
      const highlightedValue = HighlightUtils.highlightString({
        content: value,
        openingDelimiter,
        closingDelimiter,
        highlights,
      });
      const innerHTML = escape(highlightedValue)
        .replace(new RegExp(openingDelimiter, 'g'), '<b part="highlight">')
        .replace(new RegExp(closingDelimiter, 'g'), '</b>');
      return <Host innerHTML={innerHTML}></Host>;
    } catch (error) {
      this.error = error;
    }
  }

  private get resultValue() {
    let value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );

    if (Array.isArray(value)) {
      value = value.toString();
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    return value;
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

    const resultValue = this.resultValue;
    if (!resultValue && !this.default) {
      this.host.remove();
      return;
    }

    if (!resultValue && this.default) {
      return <atomic-text value={this.default}></atomic-text>;
    }

    const textValue = `${resultValue}`;
    const highlightsValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      `${this.field}Highlights`
    ) as HighlightUtils.HighlightKeyword[];

    if (this.shouldHighlight && highlightsValue) {
      return this.renderWithHighlights(textValue, highlightsValue);
    }

    return textValue;
  }
}
