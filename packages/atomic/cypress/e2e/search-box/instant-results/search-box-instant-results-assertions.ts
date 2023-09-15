import {InstantResultsSelectors} from './search-box-instant-results-selectors';

export function assertHasResultCount(count: number) {
  InstantResultsSelectors.results().should('have.length', count);
}

export function assertResultIsSelected(index: number) {
  InstantResultsSelectors.results()
    .eq(index)
    .invoke('attr', 'part')
    .should('contain', 'active-suggestion');
}

export function assertNoResultIsSelected() {
  InstantResultsSelectors.results().each((el) =>
    expect(el.attr('part')).to.not.contain('active-suggestion')
  );
}

export function assertLogSearchboxAsYouType() {
  cy.expectSearchEvent('searchboxAsYouType');
}
