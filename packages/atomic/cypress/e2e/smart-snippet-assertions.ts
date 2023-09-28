import {InlineLink} from '@coveo/headless';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

export function assertShowMore(display: boolean) {
  SmartSnippetSelectors.showMoreButton().should(
    display ? 'be.visible' : 'not.exist'
  );
}

export function assertShowLess(display: boolean) {
  SmartSnippetSelectors.showLessButton().should(
    display ? 'be.visible' : 'not.exist'
  );
}

export function assertAnswerHeight(expectedHeight: number) {
  SmartSnippetSelectors.truncatedAnswer()
    .invoke('height')
    .then((height) => {
      const roundedHeight = Math.round(height!);
      cy.wrap(roundedHeight).should('equal', expectedHeight);
    });
}

export function assertCollapseWrapperHeight(expectedHeight: number) {
  SmartSnippetSelectors.collapseWrapper()
    .invoke('height')
    .should('equal', expectedHeight);
}

export function assertAnswerTopMargin(
  marginValue: number,
  firstElementClass: string
) {
  it(`has a ${marginValue}px gap between the title and the snippet`, () => {
    SmartSnippetSelectors.question()
      .distanceTo(() =>
        SmartSnippetSelectors.answer().find(`.${firstElementClass}`)
      )
      .then((margin) => {
        const roundedMargin = Math.round(margin.vertical);
        cy.wrap(roundedMargin).should('eq', marginValue);
      });
  });
}

export function assertAnswerBottomMargin(
  marginValue: number,
  lastElementClass: string
) {
  it(`has a ${marginValue}px gap between the snippet and the footer`, () => {
    SmartSnippetSelectors.answer()
      .find(`.${lastElementClass}`)
      .distanceTo(SmartSnippetSelectors.footer)
      .then((margin) => {
        const roundedMargin = Math.round(margin.vertical);
        cy.wrap(roundedMargin).should('eq', marginValue);
      });
  });
}

export function assertLikeButtonChecked(checked: boolean) {
  SmartSnippetSelectors.feedbackLikeButton()
    .find('input')
    .should(checked ? 'be.checked' : 'not.be.checked');
}

export function assertDislikeButtonChecked(checked: boolean) {
  SmartSnippetSelectors.feedbackDislikeButton()
    .find('input')
    .should(checked ? 'be.checked' : 'not.be.checked');
}

export function assertThankYouBanner(display: boolean) {
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
