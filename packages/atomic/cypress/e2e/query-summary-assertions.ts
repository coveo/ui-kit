import {QuerySummarySelectors} from './query-summary-selectors';

export function assertContentShouldMatch(content: RegExp | string) {
  it('content should match', () => {
    QuerySummarySelectors.text().should('match', content);
  });
}
