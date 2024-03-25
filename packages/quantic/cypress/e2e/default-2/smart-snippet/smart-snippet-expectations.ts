import {InterceptAliases} from '../../../page-objects/search';
import {getAnalyticsBodyFromInterception} from '../../common-expectations';
import {should} from '../../common-selectors';
import {
  SmartSnippetSelector,
  SmartSnippetSelectors,
} from './smart-snippet-selectors';

function logCustomSmartSnippetEvent(event: string) {
  cy.wait(event)
    .then((interception) => {
      const analyticsBody = interception.request.body;
      expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
    })
    .logDetail(`should log the '${event}' UA event`);
}

function smartSnippetExpectations(selector: SmartSnippetSelector) {
  return {
    displaySmartSnippetCard: (display: boolean) => {
      selector
        .smartSnippetCard()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should} display the smart snippet`);
    },

    displaySmartSnippetQuestion: (value: string) => {
      selector
        .smartSnippetQuestion()
        .contains(value)
        .logDetail('should display the correct smart snippet question');
    },

    displaySmartSnippetAnswer: (answer: {
      text: string;
      link: {text: string; href: string};
    }) => {
      selector
        .smartSnippetAnswer()
        .then((elem) => {
          const linkElement: HTMLAnchorElement | null = elem[0].querySelector(
            '[data-cy="answer-inline-link"]'
          );
          const textElement = elem[0].querySelector('[data-cy="answer-text"]');

          expect(textElement?.textContent).to.equal(answer.text);
          expect(linkElement?.target).to.equal('_blank');
          expect(linkElement?.textContent).to.equal(answer.link.text);
          expect(linkElement?.href).to.equal(answer.link.href);
        })
        .logDetail('should display the correct smart snippet answer');
    },

    displaySmartSnippetSourceUri: (value: string) => {
      selector
        .smartSnippetSourceUri()
        .contains(value)
        .logDetail('should display the correct smart snippet source uri');
    },

    displaySmartSnippetSourceTitle: (value: string) => {
      selector
        .smartSnippetSourceTitle()
        .contains(value)
        .logDetail('should display the correct smart snippet source title');
    },

    displaySmartSnippetAnswerToggle: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should} display the smart snippet toggle`);
    },

    displaySmartSnippetShowMoreButton: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .contains('Show more')
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should} display the smart snippet show more button`);
    },

    displaySmartSnippetShowLessButton: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .contains('Show less')
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should}display the smart snippet show less button`);
    },

    displayCollapsedSmartSnippetAnswer: (collapsed: boolean) => {
      selector
        .smartSnippetExpandableAnswer()
        .should('exist')
        .should(
          collapsed ? 'have.class' : 'not.have.class',
          'smart-snippet__answer--collapsed'
        )
        .logDetail(
          `${should(collapsed)} display a collapsed smart snippet answer`
        );
    },

    displayExpandedSmartSnippetAnswer: (expanded: boolean) => {
      selector
        .smartSnippetExpandableAnswer()
        .should('exist')
        .should(
          expanded ? 'have.class' : 'not.have.class',
          'smart-snippet__answer--expanded'
        )
        .logDetail(
          `${should(expanded)} display an expanded smart snippet answer`
        );
    },

    displayExplainWhyButton: (display: boolean) => {
      selector
        .smartSnippetExplainWhyButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should} display the smart snippet explain why button`);
    },

    logExpandSmartSnippet: () => {
      logCustomSmartSnippetEvent(InterceptAliases.UA.ExpandSmartSnippet);
    },

    logCollapseSmartSnippet: () => {
      logCustomSmartSnippetEvent(InterceptAliases.UA.CollapseSmartSnippet);
    },

    logOpenSmartSnippetSource: (document: {
      title: string;
      uri: string;
      permanentId: string;
    }) => {
      const {title, uri, permanentId} = document;
      cy.wait(InterceptAliases.UA.OpenSmartSnippetSource)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromInterception(interception);
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property('documentTitle', title);
          expect(analyticsBody).to.have.property('documentUri', uri);
          expect(analyticsBody).to.have.property('documentUrl', uri);
          expect(analyticsBody).to.have.property('documentPosition', 1);
          expect(customData).to.have.property('contentIDKey', 'permanentid');
          expect(customData).to.have.property('contentIDValue', permanentId);
        })
        .logDetail("should log the 'openSmartSnippetSource' UA event");
    },

    logOpenSmartSnippetInlineLink: (document: {
      title: string;
      uri: string;
      permanentId: string;
      linkText: string;
      linkUrl: string;
    }) => {
      const {linkUrl, linkText, title, uri, permanentId} = document;
      cy.wait(InterceptAliases.UA.OpenSmartSnippetInlineLink)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromInterception(interception);
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property('documentTitle', title);
          expect(analyticsBody).to.have.property('documentUri', uri);
          expect(analyticsBody).to.have.property('documentUrl', uri);
          expect(analyticsBody).to.have.property('documentPosition', 1);
          expect(customData).to.have.property('contentIDKey', 'permanentid');
          expect(customData).to.have.property('contentIDValue', permanentId);
          expect(customData).to.have.property('linkText', linkText);
          expect(customData).to.have.property('linkURL', linkUrl);
        })
        .logDetail("should log the 'openSmartSnippetInlineLink' UA event");
    },

    logLikeSmartSnippet: () => {
      logCustomSmartSnippetEvent(InterceptAliases.UA.LikeSmartSnippet);
    },

    logDislikeSmartSnippet: () => {
      logCustomSmartSnippetEvent(InterceptAliases.UA.DislikeSmartSnippet);
    },

    logOpenSmartSnippetFeedbackModal: () => {
      logCustomSmartSnippetEvent(
        InterceptAliases.UA.OpenSmartSnippetFeedbackModal
      );
    },

    logCloseSmartSnippetFeedbackModal: () => {
      logCustomSmartSnippetEvent(
        InterceptAliases.UA.CloseSmartSnippetFeedbackModal
      );
    },

    logSendSmartSnippetReason: (payload: {
      reason: string;
      details?: string;
    }) => {
      cy.wait(InterceptAliases.UA.SendSmartSnippetReason)
        .then((interception) => {
          const analyticsBody = getAnalyticsBodyFromInterception(interception);
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
          expect(customData).to.have.property('reason', payload.reason);
          if (payload.details) {
            expect(customData).to.have.property('details', payload.details);
          }
        })
        .logDetail("should log the 'sendSmartSnippetReason' UA event");
    },
  };
}

export const SmartSnippetExpectations = {
  ...smartSnippetExpectations(SmartSnippetSelectors),
};
