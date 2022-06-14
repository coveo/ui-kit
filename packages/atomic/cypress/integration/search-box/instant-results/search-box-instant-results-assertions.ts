import {InstantResultsSelectors} from './search-box-instant-results-selectors';

export function assertHasResultCount(count: number) {
  it(`should display ${count} suggestions`, () => {
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
    InstantResultsSelectors.results().each((el) =>
      expect(el.attr('part')).to.not.contain('active-suggestion')
    );
  });
}
