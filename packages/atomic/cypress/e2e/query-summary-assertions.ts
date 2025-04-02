import {QuerySummarySelectors} from './query-summary-selectors';

export function assertEmpty() {
  it('query summary should be empty', () => {
    QuerySummarySelectors.host().should('be.empty');
  });
}

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

export function assertHasQuery(text: string) {
  it(`the query should be "${text}"`, () => {
    QuerySummarySelectors.query().should(($el) =>
      expect($el.text()).to.equal(text)
    );
  });
}
