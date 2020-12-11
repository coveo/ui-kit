import {Component, Prop, Element, h} from '@stencil/core';
import {Result, ResultTemplatesHelpers, highlightString} from '@coveo/headless';
import {
  ResultContext,
  ResultContextRenderer,
} from '../result-template-decorators';

@Component({
  tag: 'atomic-result-value',
  shadow: true,
})
export class AtomicResultValue {
  @Element() host!: HTMLDivElement;
  @Prop() value = '';
  @Prop() shouldHighlightWith = '';

  @ResultContext() private result!: Result;

  /**
   * Returns the value of 'shouldHighlightWith' prop from the Result
   */
  private getHighlightsFromResult() {
    const highlightsKeywords = Object.entries(this.result).find(
      (keyValue) => keyValue[0] === this.shouldHighlightWith
    );
    return highlightsKeywords![1] as string[];
  }

  @ResultContextRenderer
  render() {
    let resultValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.value
    );

    if (resultValue !== null) {
      if (this.shouldHighlightWith && this.shouldHighlightWith in this.result) {
        resultValue = highlightString({
          content: resultValue as string,
          openingDelimiter: '<strong>',
          closingDelimiter: '</strong>',
          highlights: this.getHighlightsFromResult(),
        });
        return <span innerHTML={resultValue as string}></span>;
      }
      return <span>{resultValue}</span>;
    }

    this.host.remove();
  }
}
