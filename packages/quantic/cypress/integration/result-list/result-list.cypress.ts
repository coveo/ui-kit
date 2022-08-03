import {configure} from '../../page-objects/configurator';
import {
  extractResults,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {ResultListExpectations as Expect} from './result-list-expectations';
import {getNextResults} from '../../page-objects/actions/action-get-next-results';
import {performSearch} from '../../page-objects/actions/action-perform-search';
import {scope} from '../../reporters/detailed-collector';
import {uesCaseParamTest, useCaseEnum} from '../../page-objects/use-case';

interface ResultListOptions {
  useCase: string;
  fieldsToInclude: string;
}

describe('quantic-resultlist', () => {
  const pageUrl = 's/quantic-result-list';

  const defaultFieldsToInclude =
    'date,author,source,language,filetype,parents,sfknowledgearticleid';
  const registerResultTemplatesEvent = 'registerresulttemplates';

  const indexResultsAlias = '@indexResults';

  function visitResultList(options: Partial<ResultListOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase !== useCaseEnum.search) {
      cy.wait(1000);
      performSearch();
    }
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure({useCase});
  }

  function aliasResultValues() {
    cy.wait(InterceptAliases.Search).then((interception) => {
      const results = extractResults(interception.response);
      cy.wrap(results).as(indexResultsAlias.substring(1));
    });
  }

  uesCaseParamTest.forEach((param) => {
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
          aliasResultValues();

          scope('when loading the page', () => {
            Expect.events.receivedEvent(true, registerResultTemplatesEvent);
            Expect.resultsEqual(indexResultsAlias);

            performSearch();

            Expect.requestFields(defaultFieldsToInclude.split(','));
          });

          scope('when getting different results', () => {
            getNextResults();

            Expect.resultsEqual(indexResultsAlias);

            performSearch();

            Expect.requestFields(defaultFieldsToInclude.split(','));
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
          aliasResultValues();

          Expect.resultsEqual(indexResultsAlias);

          performSearch();

          Expect.requestFields(customFieldsToInclude.split(','));
        });
      });
    });
  });
});
