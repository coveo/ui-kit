import {InlineLink} from '@coveo/headless';
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

export function assertLogOpenSmartSnippetSuggestionsSource(log: boolean) {
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

export function assertLogOpenSmartSnippetSuggestionsInlineLink(
  getLinkToLog: (() => InlineLink) | null
) {
  it(`${should(
    !!getLinkToLog
  )} log a openSmartSnippetSuggestionsInlineLink click event`, () => {
    if (getLinkToLog) {
      const {linkText, linkURL} = getLinkToLog();
      cy.expectClickEvent('openSmartSnippetSuggestionsInlineLink').should(
        (clickEvent) => {
          expect(clickEvent).to.have.property('customData');
          expect(clickEvent.customData).to.have.property('linkText', linkText);
          expect(clickEvent.customData).to.have.property('linkURL', linkURL);
        }
      );
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}
