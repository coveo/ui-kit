import {QuerySummarySelectors} from './query-summary-selectors';

export function assertContentShouldMatch(content: RegExp | string) {
  it('content should match', () => {
    QuerySummarySelectors.text().should('match', content);
  });
}

export function assertHasPlaceholder() {
  it('placeholder should be displayed', () => {
    QuerySummarySelectors.placeholder().should('be.visible');
  });
}