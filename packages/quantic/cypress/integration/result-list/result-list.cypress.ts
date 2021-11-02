import {configure} from '../../page-objects/configurator';
import {
  extractResults,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {ResultListExpectations as Expect} from './result-list-expectations';
import {getNextResults} from '../../page-objects/actions/action-get-next-results';
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

  function visitResultList(
    options: Partial<ResultListOptions>,
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
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
        Expect.requestFields(defaultFieldsToInclude.split(','));
      });

      scope('when getting different results', () => {
        aliasResultValues();
        getNextResults();

        Expect.displayResults(true);
        Expect.resultsEqual(indexResultsAlias);
        Expect.requestFields(defaultFieldsToInclude.split(','));
      });
    });
  });

  describe('with custom options', () => {
    it('should display the right number of pages', () => {
      const customFieldsToInclude =
        'source,language,sfcasestatus,sfcreatedbyname';
      visitResultList({
        fieldsToInclude: customFieldsToInclude,
      });

      Expect.requestFields(customFieldsToInclude.split(','));
    });
  });
});
