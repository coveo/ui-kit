import {SearchBoxSelectors} from './search-box-selectors';

export function assertFocusSearchBox(
  searchBoxSelector = SearchBoxSelectors.inputBox
) {
  it('should focus on the search box', () => {
    searchBoxSelector().should('be.focused');
  });
}

export function assertHasText(
  text: string,
  searchBoxSelector = SearchBoxSelectors.inputBox
) {
  it(`should contain "${text}"`, () => {
    searchBoxSelector().should('have.value', text);
  });
}

export function assertHasSuggestionsCount(count: number) {
  it(`should display ${count} suggestions`, () => {
    SearchBoxSelectors.querySuggestions()
      .filter(':visible') // TODO(fix): Returns true even when the parent suggestions wrapper is hidden
      .should('have.length', count);

    // TODO: Verify that the suggestions wrapper is visible and not hidden
    // Cypress cannot reliably detect visible state of suggestions popup
    // https://github.com/cypress-io/cypress/issues/25754
    // if (count > 0) {
    //   SearchBoxSelectors.querySuggestionsWrapper().should('be.visible');
    // } else {
    //   SearchBoxSelectors.querySuggestionsWrapper().should('not.be.visible');
    // }
  });
}

export function assertNoSuggestionGenerated() {
  it('should have no suggestions', () => {
    SearchBoxSelectors.querySuggestions().should('not.exist');
  });
}

export function assertSuggestionIsSelected(index: number) {
  it(`should have selected suggestion ${index}`, () => {
    SearchBoxSelectors.querySuggestions()
      .eq(index)
      .invoke('attr', 'part')
      .should('contain', 'active-suggestion');
  });
}

export function assertSuggestionIsHighlighted(index: number) {
  it(`should have highlighted suggestion ${index}`, () => {
    SearchBoxSelectors.querySuggestions()
      .eq(index)
      .invoke('attr', 'class')
      .should('contain', 'bg-neutral-light');
  });
}

export function assertNoSuggestionIsSelected() {
  it('should have no selected result', () => {
    SearchBoxSelectors.querySuggestions().each((el) =>
      expect(el.attr('part')).to.not.contain('active-suggestion')
    );
  });
}

export function assertLogSearchFromLink(query: string) {
  it('should log a searchFromLink event with the right query ', () => {
    cy.expectSearchEvent('searchFromLink').then((analyticsBody) => {
      expect(analyticsBody).to.have.property('queryText', query);
    });
  });
}

export function assertLogOmniboxFromLink(suggestion: string) {
  it('should log a omniboxFromLink event with the right query ', () => {
    cy.expectSearchEvent('omniboxFromLink').then((analyticsBody) => {
      expect(analyticsBody).to.have.property('queryText', suggestion);
    });
  });
}
