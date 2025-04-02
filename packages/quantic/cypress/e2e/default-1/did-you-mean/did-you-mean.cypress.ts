import {
  performSearch,
  setQuery,
} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  mockSearchWithDidYouMean,
  mockSearchWithDidYouMeanAutomaticallyCorrected,
  mockSearchWithResults,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
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

describe('quantic-did-you-mean', () => {
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

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('when a correct search query is performed', () => {
        it('should not display the did you mean message', () => {
          visitDidYouMean({useCase: param.useCase});
          cy.wait(getQueryAlias(param.useCase));
          setQuery(exampleCorrectedQuery);
          performSearch();
          Expect.displayDidYouMeanLabel(false);
          Expect.displayNoResultLabel(false);
        });
      });

      describe('when an incorrect search query is performed but results are found', () => {
        it('should display the did you mean message', () => {
          visitDidYouMean({useCase: param.useCase});
          cy.wait(getQueryAlias(param.useCase));
          setQuery(exampleOriginalQuery);
          mockSearchWithDidYouMean(
            param.useCase,
            exampleOriginalQuery,
            exampleCorrectedQuery
          );

          scope('when executing a search', () => {
            performSearch();

            Expect.displayDidYouMeanLabel(true);
            Expect.displayApplyCorrectionButton(true);
            Expect.applyCorrectionButtonContains(exampleCorrectedQuery);
            Expect.displayNoResultLabel(false);
            Expect.displayAutomaticQueryCorrectionLabel(false);
          });

          scope('when applying the correction', () => {
            mockSearchWithResults([], param.useCase);
            Actions.applyCorrection();

            Expect.logDidYouMeanClick(exampleCorrectedQuery);
            Expect.displayDidYouMeanLabel(false);
            Expect.displayApplyCorrectionButton(false);
            Expect.displayNoResultLabel(false);
            Expect.displayAutomaticQueryCorrectionLabel(false);
          });
        });
      });

      describe('when an incorrect search query is performed but no results are found', () => {
        it('should automatically correct the query', () => {
          visitDidYouMean({useCase: param.useCase});
          cy.wait(getQueryAlias(param.useCase));
          setQuery(exampleOriginalQuery);
          mockSearchWithDidYouMeanAutomaticallyCorrected(
            param.useCase,
            exampleOriginalQuery,
            exampleCorrectedQuery
          );

          performSearch();

          Expect.displayDidYouMeanLabel(false);
          Expect.displayApplyCorrectionButton(false);
          Expect.displayNoResultLabel(true);
          Expect.noResultLabelContains(exampleOriginalQuery);
          Expect.displayAutomaticQueryCorrectionLabel(true);
          Expect.automaticQueryCorrectionLabelContains(exampleCorrectedQuery);
          Expect.logDidYouMeanAutomaticCorrection();
        });
      });
    });
  });
});
