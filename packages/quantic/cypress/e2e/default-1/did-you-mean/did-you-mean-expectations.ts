import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {
  DidYouMeanSelector,
  DidYouMeanSelectors,
} from './did-you-mean-selectors';

function didYouMeanExpectations(selector: DidYouMeanSelector) {
  return {
    displayNoResultLabel: (display: boolean) => {
      selector
        .noResultLabel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the no result label`);
    },

    noResultLabelContains: (originalWord: string) => {
      selector
        .noResultLabel()
        .should('contain', originalWord)
        .logDetail(
          `the no result label should contain the word "${originalWord}"`
        );
    },

    displayDidYouMeanLabel: (display: boolean) => {
      selector
        .didYouMeanLabel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the did you mean label`);
    },

    displayAutomaticQueryCorrectionLabel: (display: boolean) => {
      selector
        .automaticQueryCorrectionLabel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the query correction label`);
    },

    automaticQueryCorrectionLabelContains: (correctedWord: string) => {
      selector
        .automaticQueryCorrectionLabel()
        .should('contain', correctedWord)
        .logDetail(
          `the query correction label should contain the word "${correctedWord}"`
        );
    },

    displayApplyCorrectionButton: (display: boolean) => {
      selector
        .applyCorrectionButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the apply correction button`);
    },

    applyCorrectionButtonContains: (correctedWord: string) => {
      selector
        .applyCorrectionButton()
        .should('contain', correctedWord)
        .logDetail(
          `the apply correction button should contain the word "${correctedWord}"`
        );
    },

    displayShowingResultsForLabel: (display: boolean) => {
      selector
        .showingResultsForLabel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the showing results for label`);
    },

    showingResultsForLabelContains: (newWord: string) => {
      selector
        .showingResultsForLabel()
        .should('contain', newWord)
        .logDetail(
          `the showing results for label should contain the word "${newWord}"`
        );
    },

    displaySearchInsteadForLabel: (display: boolean) => {
      selector
        .searchInsteadForLabel()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the search instead for label`);
    },

    displayUndoButton: (display: boolean) => {
      selector
        .undoButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the undo button`);
    },

    undoButtonContains: (originalWord: string) => {
      selector
        .undoButton()
        .should('contain', originalWord)
        .logDetail(`the undo button should contain the word "${originalWord}"`);
    },

    logDidYouMeanAutomaticCorrection: () => {
      cy.wait(InterceptAliases.UA.DidYouMean).logDetail(
        "should log the 'didyoumeanAutomatic' UA event"
      );
    },

    logQueryPipelineTrigger: (query: string) => {
      cy.wait(InterceptAliases.UA.PipelineTriggers.query)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          const customData = analyticsBody?.customData;
          expect(analyticsBody).to.have.property(
            'eventType',
            'queryPipelineTriggers'
          );
          expect(analyticsBody).to.have.property('eventValue', 'query');
          expect(customData).to.have.property('query', query);
        })
        .logDetail("should log the 'queryPipelineTriggers' UA event");
    },

    logUndoQuery: (query: string) => {
      cy.wait(InterceptAliases.UA.UndoQuery)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          const customData = analyticsBody?.customData;
          expect(customData).to.have.property('undoneQuery', query);
        })
        .logDetail("should log the 'undoQuery' UA event");
    },

    logSearchBoxSubmit: (query: string) => {
      cy.wait(InterceptAliases.UA.SearchboxSubmit)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('queryText', query);
        })
        .logDetail("should log the 'searchBoxSubmit' UA event");
    },

    logDidYouMeanClick: (query: string) => {
      cy.wait(InterceptAliases.UA.DidyoumeanClick)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property('queryText', query);
        })
        .logDetail("should log the 'didYouMeanClick' UA event");
    },
  };
}

export const DidYouMeanExpectations = {
  ...didYouMeanExpectations(DidYouMeanSelectors),
};
