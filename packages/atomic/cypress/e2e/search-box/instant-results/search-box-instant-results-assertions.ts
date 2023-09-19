import {InstantResultsSelectors} from './search-box-instant-results-selectors';

export function assertHasResultCount(count: number) {
  it(`should display ${count} results`, () => {
    InstantResultsSelectors.results().should('have.length', count);
  });
}

export function assertResultIsSelected(index: number) {
  it(`should have selected result ${index}`, () => {
    InstantResultsSelectors.results()
      .eq(index)
      .invoke('attr', 'part')
      .should('contain', 'active-suggestion');
  });
}

export function assertNoResultIsSelected() {
  it('should have no selected result', () => {
    InstantResultsSelectors.activeResult().should('not.exist');
  });
}

export function assertLogSearchboxAsYouType() {
  it('should log the SearchboxAsYouType event to UA', () => {
    cy.expectSearchEvent('searchboxAsYouType');
  });
}
