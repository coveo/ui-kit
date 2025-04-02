import {
  performSearch,
  setQuery,
} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  mockSearchWithQueryTrigger,
} from '../../../page-objects/search';
import {
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {DidYouMeanActions as Actions} from './did-you-mean-actions';
import {DidYouMeanExpectations as Expect} from './did-you-mean-expectations';

interface DidYouMeanOptions {
  useCase: string;
}

const exampleOriginalQuery = 'original query';
const exampleCorrectedQuery = 'corrected query';

describe('query pipeline trigger', () => {
  const pageUrl = 's/quantic-did-you-mean';

  function visitDidYouMean(options: Partial<DidYouMeanOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  describe('query pipeline triggers', () => {
    describe('when a query pipeline trigger is fired', () => {
      it('should automatically trigger the new query', () => {
        visitDidYouMean({useCase: 'search'});
        cy.wait(getQueryAlias());
        setQuery(exampleOriginalQuery);
        mockSearchWithQueryTrigger('search', exampleCorrectedQuery);

        scope('when executing a search', () => {
          performSearch();

          Expect.displayShowingResultsForLabel(true);
          Expect.showingResultsForLabelContains(exampleCorrectedQuery);
          Expect.displaySearchInsteadForLabel(true);
          Expect.displayUndoButton(true);
          Expect.undoButtonContains(exampleOriginalQuery);
          Expect.logQueryPipelineTrigger(exampleCorrectedQuery);
        });

        scope('when clicking the undo button', () => {
          Actions.clickUndoButton();
          cy.wait(getQueryAlias());
          Expect.logUndoQuery(exampleCorrectedQuery);
        });
      });
    });

    describe('when no query pipeline trigger is fired', () => {
      it('should not modify the query', () => {
        visitDidYouMean({useCase: 'search'});
        cy.wait(getQueryAlias());
        setQuery(exampleOriginalQuery);

        scope('when executing a search', () => {
          performSearch();

          Expect.logSearchBoxSubmit(exampleOriginalQuery);
          Expect.displayShowingResultsForLabel(false);
          Expect.displaySearchInsteadForLabel(false);
          Expect.displayUndoButton(false);
        });
      });
    });
  });
});
