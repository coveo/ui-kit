import {SearchBoxSelectors} from './search-box-selectors';

export function assertFocusSearchBox(
  searchBoxSelector = SearchBoxSelectors.inputBox
) {
  it('should focus on the search box', () => {
    searchBoxSelector().should('be.focused');
  });
}
//TODO(a): Remove when no more references and standalone-search-box + search-box use assertHasTextWithoutIt
export function assertHasText(
  text: string,
  searchBoxSelector = SearchBoxSelectors.inputBox
) {
  it(`should contain "${text}"`, () => {
    searchBoxSelector().should('have.value', text);
  });
}

export function assertHasTextWithoutIt(
  text: string,
  searchBoxSelector = SearchBoxSelectors.inputBox
) {
  searchBoxSelector().should('have.value', text);
}

//TODO(a): Remove when no more references and search-box use assertHasSuggestionsCountWithoutIt
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

export function assertHasSuggestionsCountWithoutIt(count: number) {
  SearchBoxSelectors.querySuggestions()
    .filter(':visible')
    .should('have.length', count);
}

export function assertNoSuggestionGenerated() {
  it('should have no suggestions', () => {
    SearchBoxSelectors.querySuggestions().should('not.exist');
  });
}

//TODO(a): Remove when no more references and search-box use assertSuggestionIsSelectedWithoutIt
export function assertSuggestionIsSelected(index: number) {
  it(`should have selected suggestion ${index}`, () => {
    SearchBoxSelectors.querySuggestions()
      .eq(index)
      .invoke('attr', 'part')
      .should('contain', 'active-suggestion');
  });
}

export function assertSuggestionIsSelectedWithoutIt(index: number) {
  SearchBoxSelectors.querySuggestions()
    .eq(index)
    .invoke('attr', 'part')
    .should('contain', 'active-suggestion');
}

export function assertSuggestionIsHighlightedwithoutIt(index: number) {
  SearchBoxSelectors.querySuggestions()
    .eq(index)
    .invoke('attr', 'class')
    .should('contain', 'bg-neutral-light');
}

export function assertNoSuggestionIsSelected() {
  SearchBoxSelectors.querySuggestions().each((el) =>
    expect(el.attr('part')).to.not.contain('active-suggestion')
  );
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
