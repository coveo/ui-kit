import {InlineLink} from '@coveo/headless';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

export function assertShowMoreWithoutIt(display: boolean) {
  SmartSnippetSelectors.showMoreButton().should(
    display ? 'be.visible' : 'not.exist'
  );
}

export function assertShowLessWithoutIt(display: boolean) {
  SmartSnippetSelectors.showLessButton().should(
    display ? 'be.visible' : 'not.exist'
  );
}

export function assertAnswerHeightWithoutIt(expectedHeight: number) {
  SmartSnippetSelectors.truncatedAnswer()
    .invoke('height')
    .should('equal', expectedHeight);
}

export function assertCollapseWrapperHeightWithoutIt(expectedHeight: number) {
  SmartSnippetSelectors.collapseWrapper()
    .invoke('height')
    .should('equal', expectedHeight);
}

export function assertAnswerTopMargin(
  margin: number,
  firstElementClass: string
) {
  it(`has a ${margin}px gap between the title and the snippet`, () => {
    SmartSnippetSelectors.question()
      .distanceTo(() =>
        SmartSnippetSelectors.answer().find(`.${firstElementClass}`)
      )
      .should('have.property', 'vertical', margin);
  });
}

export function assertAnswerBottomMargin(
  margin: number,
  lastElementClass: string
) {
  it(`has a ${margin}px gap between the snippet and the footer`, () => {
    SmartSnippetSelectors.answer()
      .find(`.${lastElementClass}`)
      .distanceTo(SmartSnippetSelectors.footer)
      .should('have.property', 'vertical', margin);
  });
}

export function assertLikeButtonCheckedWithoutIt(checked: boolean) {
  SmartSnippetSelectors.feedbackLikeButton()
    .find('input')
    .should(checked ? 'be.checked' : 'not.be.checked');
}

export function assertDislikeButtonCheckedWithoutIt(checked: boolean) {
  SmartSnippetSelectors.feedbackDislikeButton()
    .find('input')
    .should(checked ? 'be.checked' : 'not.be.checked');
}

export function assertThankYouBannerWithoutIt(display: boolean) {
  SmartSnippetSelectors.feedbackThankYou().should(
    display ? 'exist' : 'not.exist'
  );
}

export function assertLogLikeSmartSnippet() {
  it('should log a likeSmartSnippet custom event', () => {
    cy.expectCustomEvent('smartSnippet', 'likeSmartSnippet');
  });
}

export function assertLogDislikeSmartSnippet() {
  it('should log a dislikeSmartSnippet custom event', () => {
    cy.expectCustomEvent('smartSnippet', 'dislikeSmartSnippet');
  });
}

export function assertLogOpenSmartSnippetSource(log: boolean) {
  it(`${should(log)} log a openSmartSnippetSource click event`, () => {
    if (log) {
      cy.expectClickEvent('openSmartSnippetSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}

export function assertLogOpenSmartSnippetInlineLink(
  getLinkToLog: (() => InlineLink) | null
) {
  it(`${should(
    !!getLinkToLog
  )} log a openSmartSnippetInlineLink click event`, () => {
    if (getLinkToLog) {
      const {linkText, linkURL} = getLinkToLog();
      cy.expectClickEvent('openSmartSnippetInlineLink').should((clickEvent) => {
        expect(clickEvent).to.have.property('customData');
        expect(clickEvent.customData).to.have.property('linkText', linkText);
        expect(clickEvent.customData).to.have.property('linkURL', linkURL);
      });
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker).invoke('getLastClickEvent').should('not.exist');
    }
  });
}
