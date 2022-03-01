import {SearchBoxSelectors} from './search-box-selectors';

export function assertFocusSearchBox() {
  it('should focus on the search box', () => {
    SearchBoxSelectors.inputBox().should('be.focused');
  });
}

export function assertHasText(text: string) {
  it(`should contain "${text}"`, () => {
    SearchBoxSelectors.inputBox().should('have.value', text);
  });
}

export function assertHasSuggestionsCount(count: number) {
  it(`should display ${count} suggestions`, () => {
    SearchBoxSelectors.querySuggestions().should('have.length', count);
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
