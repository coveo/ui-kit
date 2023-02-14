import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {
  SmartSnippetSelector,
  SmartSnippetSelectors,
} from './smart-snippet-selectors';

function smartSnippetExpectations(selector: SmartSnippetSelector) {
  return {
    displaySmartSnippetCard: (display: boolean) => {
      selector
        .smartSnippetCard()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the smart snippet');
    },

    displaySmartSnippetQuestion: (value: string) => {
      selector
        .smartSnippetQuestion()
        .contains(value)
        .log('should display the correct smart snippet question');
    },

    displaySmartSnippetAnswer: (value: string) => {
      selector
        .smartSnippetAnswer()
        .then((elem) => {
          expect(elem[0].innerHTML).to.eq(value);
        })
        .log('should display the correct smart snippet answer');
    },

    displaySmartSnippetSourceUri: (value: string) => {
      selector
        .smartSnippetSourceUri()
        .contains(value)
        .log('should display the correct smart snippet source uri');
    },

    displaySmartSnippetSourceTitle: (value: string) => {
      selector
        .smartSnippetSourceTitle()
        .contains(value)
        .log('should display the correct smart snippet source title');
    },

    displaySmartSnippetAnswerToggle: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .should(display ? 'exist' : 'not.exist')
        .log('should display the smart snippet toggle');
    },

    displaySmartSnippetShowMoreButton: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .contains('Show more')
        .should(display ? 'exist' : 'not.exist')
        .log('should display the smart snippet show more button');
    },

    displaySmartSnippetShowLessButton: (display: boolean) => {
      selector
        .smartSnippetAnswerToggle()
        .contains('Show less')
        .should(display ? 'exist' : 'not.exist')
        .log('should display the smart snippet show less button');
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

    logExpandSmartSnippet: () => {
      cy.wait(InterceptAliases.UA.ExpandSmartSnippet)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
        })
        .logDetail("should log the 'expandSmartSnippet' UA event");
    },

    logCollapseSmartSnippet: () => {
      cy.wait(InterceptAliases.UA.CollapseSmartSnippet)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
        })
        .logDetail("should log the 'collapseSmartSnippet' UA event");
    },

    logOpenSmartSnippetSource: (document: {
      title: string;
      uri: string;
      permanentId: string;
    }) => {
      const {title, uri, permanentId} = document;
      cy.wait(InterceptAliases.UA.OpenSmartSnippetSource)
        .then((interception) => {
          const analyticsBody = interception.request.body;
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
          const analyticsBody = interception.request.body;
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
      cy.wait(InterceptAliases.UA.likeSmartSnippet)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
        })
        .logDetail("should log the 'likeSmartSnippet' UA event");
    },

    logDisikeSmartSnippet: () => {
      cy.wait(InterceptAliases.UA.dislikeSmartSnippet)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('eventType', 'smartSnippet');
        })
        .logDetail("should log the 'dislikeSmartSnippet' UA event");
    },
  };
}

export const SmartSnippetExpectations = {
  ...smartSnippetExpectations(SmartSnippetSelectors),
};
