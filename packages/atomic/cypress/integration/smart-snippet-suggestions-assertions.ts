import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {SmartSnippetSuggestionsSelectors} from './smart-snippet-suggestions-selectors';

export function assertAnswerTopMargin(
  margin: number,
  firstElementClass: string
) {
  it(`has a ${margin}px gap between the first expanded button and the snippet`, () => {
    SmartSnippetSuggestionsSelectors.questionExpandedButton()
      .distanceTo(() =>
        SmartSnippetSuggestionsSelectors.answer().find(`.${firstElementClass}`)
      )
      .should('have.property', 'vertical', margin);
  });
}

export function assertAnswerBottomMargin(
  margin: number,
  lastElementClass: string
) {
  it(`has a ${margin}px gap between the snippet and the footer`, () => {
    SmartSnippetSuggestionsSelectors.answer()
      .find(`.${lastElementClass}`)
      .distanceTo(SmartSnippetSuggestionsSelectors.footer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertlogOpenSmartSnippetSuggestionsSource(log: boolean) {
  it(`${should(
    log
  )} log a openSmartSnippetSuggestionSource click event`, () => {
    if (log) {
      cy.expectClickEvent('openSmartSnippetSuggestionSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}
