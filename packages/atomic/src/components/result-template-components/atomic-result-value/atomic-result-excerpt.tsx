import {Component, Element, h} from '@stencil/core';
import {ResultContext} from '../result-template-decorators';
import {
  Result,
  ResultTemplatesHelpers,
  highlightString,
  highlightKeywordString,
} from '@coveo/headless';

@Component({
  tag: 'atomic-result-excerpt',
  shadow: true,
})
export class AtomicResultExcerpt {
  @Element() host!: HTMLDivElement;
  @ResultContext() private result!: Result;

  private getHighlightedExcerpt() {
    const resultValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      'excerpt'
    );
    const highlightKeywords = highlightKeywordString(
      this.result.excerptHighlights
    );
    return highlightString({
      content: resultValue as string,
      closingDelimiter: '</strong>',
      openingDelimiter: '<strong>',
      highlights: highlightKeywords,
    });
  }

  render() {
    return <p innerHTML={this.getHighlightedExcerpt()}></p>;
  }
}
