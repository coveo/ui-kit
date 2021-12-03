import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {RecentQueriesListExpectations as Expect} from './recent-queries-list-expectations';
import {scope} from '../../reporters/detailed-collector';
import {
  clearInput,
  performSearch,
  setQuery,
} from '../../page-objects/actions/action-perform-search';
import {RecentQueriesListSelectors} from './recent-queries-list-selectors';

interface RecentQueriesListOptions {
  maxLength: number;
  label: string;
  isCollapsed: boolean;
}

function createRandomQueriesList(length: number) {
  const result = [];
  for (let index = 0; index < length; index++) {
    result.push(
      Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 8)
    );
  }
  return result;
}

describe('quantic-recent-queries-list', () => {
  const pageUrl = 's/quantic-recent-queries-list';
  const defaultMaxLength = 10;

  function visitRecentQueries(options: Partial<RecentQueriesListOptions> = {}) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }
  function loadFromUrlHash(
    urlHash: string,
    options: Partial<RecentQueriesListOptions> = {}
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  it('should render a placeholder before results have returned', () => {
    visitRecentQueries();

    Expect.displayPlaceholder(true);
    Expect.displayQueries(false);
    Expect.displayEmptyList(true);
  });

  describe('with default options', () => {
    it('should work as expected', () => {
      visitRecentQueries();

      scope('when loading the page', () => {
        Expect.displayQueries(false);
        Expect.displayEmptyList(true);
      });

      scope('when searching new queries', () => {
        createRandomQueriesList(5).forEach((query, index) => {
          setQuery(query);
          performSearch().wait(InterceptAliases.Search);

          Expect.displayEmptyList(false);
          Expect.displayQueries(true);
          Expect.numberOfQueries(index + 1);
          Expect.lastQueryContains(query);
          Expect.displayQuery(query, true);
          Expect.urlHashContains(query);
          clearInput();
        });
      });

      scope('when searching queries greater than #maxLength', () => {
        const listQueries = createRandomQueriesList(15);
        listQueries.forEach((query) => {
          setQuery(query);
          performSearch().wait(InterceptAliases.Search);
          clearInput();
        });

        Expect.numberOfQueries(defaultMaxLength);
        Expect.displayQuery(listQueries[0], false);
      });

      scope('when selecting a query in the list', () => {
        const query1 = 'queryOne';
        const query2 = 'queryTwo';

        setQuery(query1);
        performSearch().wait(InterceptAliases.Search);
        clearInput();
        setQuery(query2);
        performSearch().wait(InterceptAliases.Search);
        clearInput();

        Expect.lastQueryContains(query2);
        Expect.urlHashContains(query2);
        RecentQueriesListSelectors.query(query1).click();
        Expect.urlHashContains(query1);
      });
    });
  });

  describe('with custom #maxLength', () => {
    const customMaxLength = 3;

    it('should work as expected', () => {
      visitRecentQueries({
        maxLength: customMaxLength,
      });

      const listQueries = createRandomQueriesList(5);
      listQueries.forEach((query) => {
        setQuery(query);
        performSearch().wait(InterceptAliases.Search);
        clearInput();
      });

      Expect.numberOfQueries(customMaxLength);
      Expect.displayQuery(listQueries[0], false);
    });
  });

  describe('with a query in the URL', () => {
    it('should work as expected', () => {
      const url = 'q=somequery';

      loadFromUrlHash(url);

      Expect.displayEmptyList(false);
      Expect.displayQuery('somequery', true);
      Expect.numberOfQueries(1);
    });
  });
});
