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

interface ResultListOptions {
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
  }

  function setupWithPauseBeforeSearch() {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure();
  }

  function aliasResultValues() {
    cy.wait(InterceptAliases.Search).then((interception) => {
      const results = extractResults(interception.response);
      cy.wrap(results).as(indexResultsAlias.substring(1));
    });
  }

  it('should render a placeholder before results have returned', () => {
    setupWithPauseBeforeSearch();

    Expect.displayPlaceholder(true);
  });

  describe('with default options', () => {
    it('should work as expected', () => {
      visitResultList({
        fieldsToInclude: defaultFieldsToInclude,
      });
      aliasResultValues();

      scope('when loading the page', () => {
        Expect.events.receivedEvent(true, registerResultTemplatesEvent);
        Expect.displayResults(true);
        Expect.resultsEqual(indexResultsAlias);

        performSearch();
        Expect.requestFields(defaultFieldsToInclude.split(','));
      });

      scope('when getting different results', () => {
        getNextResults();

        Expect.displayResults(true);
        Expect.resultsEqual(indexResultsAlias);

        performSearch();
        Expect.requestFields(defaultFieldsToInclude.split(','));
      });
    });
  });

  describe('with custom options', () => {
    const customFieldsToInclude =
      'source,language,sfcasestatus,sfcreatedbyname';

    it('should display the right number of pages', () => {
      visitResultList({
        fieldsToInclude: customFieldsToInclude,
      });

      Expect.requestFields(customFieldsToInclude.split(','));
    });
  });
});
