import {getNextResults} from '../../../page-objects/actions/action-get-next-results';
import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  extractResults,
  getQueryAlias,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {ResultListExpectations as Expect} from './result-list-expectations';

interface ResultListOptions {
  useCase: string;
  fieldsToInclude: string;
}

describe('quantic-resultlist', () => {
  const pageUrl = 's/quantic-result-list';

  const defaultFieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
  const registerResultTemplatesEvent = 'quantic__registerresulttemplates';

  const indexResultsAlias = '@indexResults';

  function visitResultList(options: Partial<ResultListOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure({useCase});
  }

  function aliasResultValues(useCase: string) {
    cy.wait(getQueryAlias(useCase)).then((interception) => {
      const results = extractResults(interception.response);
      cy.wrap(results).as(indexResultsAlias.substring(1));
    });
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should render a placeholder before results have returned', () => {
        setupWithPauseBeforeSearch(param.useCase);

        Expect.displayPlaceholder(true);
        Expect.displayResults(false);
      });

      describe('with default options', () => {
        it('should work as expected', () => {
          visitResultList({
            fieldsToInclude: defaultFieldsToInclude,
            useCase: param.useCase,
          });
          aliasResultValues(param.useCase);

          scope('when loading the page', () => {
            Expect.events.receivedEvent(true, registerResultTemplatesEvent);
            Expect.resultsEqual(indexResultsAlias);

            performSearch();

            Expect.requestFields(
              defaultFieldsToInclude.split(','),
              param.useCase
            );
          });

          scope('when getting different results', () => {
            getNextResults();

            Expect.resultsEqual(indexResultsAlias);

            performSearch();

            Expect.requestFields(
              defaultFieldsToInclude.split(','),
              param.useCase
            );
          });
        });
      });

      describe('with custom options', () => {
        const customFieldsToInclude =
          'source,language,sfcasestatus,sfcreatedbyname';

        it('should work as expected', () => {
          visitResultList({
            fieldsToInclude: customFieldsToInclude,
            useCase: param.useCase,
          });
          aliasResultValues(param.useCase);

          Expect.resultsEqual(indexResultsAlias);

          performSearch();

          Expect.requestFields(customFieldsToInclude.split(','), param.useCase);
        });
      });
    });
  });
});
