import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

export function assertShowMore(display: boolean) {
  it(`${should(display)} display the show more button`, () => {
    SmartSnippetSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertShowLess(display: boolean) {
  it(`${should(display)} display the show less button`, () => {
    SmartSnippetSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertAnswerHeight(expectedHeight: number) {
  it(`the answer should have a displayed height of ${expectedHeight}px`, () => {
    SmartSnippetSelectors.truncatedAnswer()
      .invoke('height')
      .should('equal', expectedHeight);
  });
}

export function assertAnswerTopMargin(margin: number) {
  it(`has a ${margin}px gap between the title and the snippet`, () => {
    SmartSnippetSelectors.question()
      .distanceTo(SmartSnippetSelectors.answer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertAnswerBottomMargin(margin: number) {
  it(`has a ${margin}px gap between the snippet and the show less button`, () => {
    SmartSnippetSelectors.answer()
      .distanceTo(SmartSnippetSelectors.showLessButton)
      .should('have.property', 'vertical', margin);
  });
}

export function assertLikeButtonChecked(checked: boolean) {
  it(`${should(checked)} check the like button`, () => {
    SmartSnippetSelectors.feedbackLikeButton()
      .find('input')
      .should(checked ? 'be.checked' : 'not.be.checked');
  });
}

export function assertDislikeButtonChecked(checked: boolean) {
  it(`${should(checked)} check the dislike button`, () => {
    SmartSnippetSelectors.feedbackDislikeButton()
      .find('input')
      .should(checked ? 'be.checked' : 'not.be.checked');
  });
}

export function assertThankYouBanner(display: boolean) {
  it(`${should(display)} display the like button`, () => {
    SmartSnippetSelectors.feedbackThankYou().should(
      display ? 'be.visible' : 'be.hidden'
    );
  });
}

export function assertOpenSmartSnippetSourceAnalytics(log: boolean) {
  it(`${should(log)} log a openSmartSnippetSource click event`, () => {
    if (log) {
      cy.expectClickEvent('openSmartSnippetSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}
