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
    SearchBoxSelectors.querySuggestions()
      .filter(':visible')
      .should('have.length', count);
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
  it(`should have higlighted suggestion ${index}`, () => {
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
