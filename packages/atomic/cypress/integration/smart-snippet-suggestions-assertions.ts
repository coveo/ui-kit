import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {SmartSnippetSuggestionsSelectors} from './smart-snippet-suggestions-selectors';

export function assertShowMore(display: boolean) {
  it(`${should(display)} display the show more button`, () => {
    SmartSnippetSuggestionsSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertShowLess(display: boolean) {
  it(`${should(display)} display the show less button`, () => {
    SmartSnippetSuggestionsSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertAnswerHeight(expectedHeight: number) {
  it(`the answer should have a displayed height of ${expectedHeight}px`, () => {
    SmartSnippetSuggestionsSelectors.truncatedAnswer()
      .invoke('height')
      .should('equal', expectedHeight);
  });
}

export function assertAnswerTopMargin(margin: number) {
  it(`has a ${margin}px gap between the first expanded button and the snippet`, () => {
    SmartSnippetSuggestionsSelectors.questionExpandedButton()
      .distanceTo(SmartSnippetSuggestionsSelectors.answer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertAnswerBottomMargin(margin: number) {
  it(`has a ${margin}px gap between the snippet and the footer`, () => {
    SmartSnippetSuggestionsSelectors.answer()
      .distanceTo(SmartSnippetSuggestionsSelectors.footer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertlogOpenSmartSnippetSuggestionsSource(log: boolean) {
  it.skip(`${should(log)} log a openSmartSnippetSource click event`, () => {
    if (log) {
      cy.expectClickEvent('openSmartSnippetSuggestionSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}

export function assertLogShowMoreSmartSnippetSuggestion() {
  it('should log showMoreSmartSnippetSuggestion analytics', () => {
    cy.expectCustomEvent(
      'smartSnippetSuggestions',
      'showMoreSmartSnippetSuggestion'
    );
  });
}

export function assertLogShowLessSmartSnippetSuggestion() {
  it('should log showLessSmartSnippetSuggestion analytics', () => {
    cy.expectCustomEvent(
      'smartSnippetSuggestions',
      'showLessSmartSnippetSuggestion'
    );
  });
}
