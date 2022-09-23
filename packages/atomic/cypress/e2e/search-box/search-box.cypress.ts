import {TestFixture} from '../../fixtures/test-fixture';
import {
  SafeStorage,
  StorageItems,
} from '../../../src/utils/local-storage-utils';
import {searchBoxComponent, SearchBoxSelectors} from './search-box-selectors';
import {addSearchBox} from './search-box-actions';
import * as CommonAssertions from '../common-assertions';
import * as SearchBoxAssertions from './search-box-assertions';
import {addQuerySummary} from '../query-summary-actions';
import * as QuerySummaryAssertions from '../query-summary-assertions';
import {RouteAlias} from '../../utils/setupComponent';
import {addFacet, field} from '../facets/facet/facet-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';
import {selectIdleCheckboxValueAt} from '../facets/facet-common-actions';
import * as FacetCommonAssertions from '../facets/facet-common-assertions';

const setSuggestions = (count: number) => () => {
  cy.intercept(
    {method: 'POST', path: '**/rest/search/v2/querySuggest?*'},
    (request) => {
      request.reply((response) => {
        const newResponse = response.body;
        newResponse.completions = Array.from({length: count}, (_, i) => ({
          expression: `query-suggestion-${i}`,
          executableConfidence: 0,
          highlighted: `Suggestion ${i}`,
          score: 0,
        }));
        response.send(200, newResponse);
      });
    }
  ).as(TestFixture.interceptAliases.QuerySuggestions.substring(1));
};

const setRecentQueries = (count: number) => () => {
  new SafeStorage().setJSON(
    StorageItems.RECENT_QUERIES,
    Array.from({length: count}, (_, i) => `Recent query ${i}`)
  );
};

describe('Search Box Test Suites', () => {
  describe('with maxWithoutQuery capping suggestions & recentQueries', () => {
    const numOfSuggestions = 6;
    const numOfRecentQueries = 4;
    const maxSuggestionsWithoutQuery = numOfSuggestions - 1;
    const maxRecentQueriesWithoutQuery = numOfRecentQueries - 1;

    function setupWithSuggestionsAndRecentQueries() {
      new TestFixture()
        .with(setSuggestions(numOfSuggestions))
        .with(setRecentQueries(numOfRecentQueries))
        .with(
          addSearchBox({
            suggestions: {
              maxWithoutQuery: maxSuggestionsWithoutQuery,
              maxWithQuery: numOfSuggestions,
            },
            recentQueries: {
              maxWithoutQuery: maxRecentQueriesWithoutQuery,
              maxWithQuery: numOfRecentQueries,
            },
            props: {
              'number-of-queries': numOfSuggestions + numOfRecentQueries,
              'suggestion-timeout': 2000,
            },
          })
        )
        .init();
    }

    describe('without input', () => {
      const expectedSum =
        maxSuggestionsWithoutQuery + maxRecentQueriesWithoutQuery;

      before(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().click();
      });

      SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
      CommonAssertions.assertAccessibility(searchBoxComponent);
      CommonAssertions.assertAriaLiveMessage(
        SearchBoxSelectors.searchBoxAriaLive,
        expectedSum.toString()
      );
    });

    describe('when changing the redirection-url prop, reinitializing the search box', () => {
      before(() => {
        new TestFixture()
          .with(setSuggestions(numOfSuggestions))
          .with(
            addSearchBox({
              props: {
                'redirection-url': '/search',
              },
            })
          )
          .init();
        cy.get(searchBoxComponent).invoke('attr', 'redirection-url', '');
        cy.wait(100);

        SearchBoxSelectors.inputBox().click();
        SearchBoxSelectors.querySuggestions().eq(1).click();
      });

      SearchBoxAssertions.assertHasText('query-suggestion-1');
    });

    describe('with input', () => {
      const expectedSum = numOfSuggestions + numOfRecentQueries;

      function setInputText() {
        SearchBoxSelectors.inputBox().type('Rec');
      }

      describe('verify rendering', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();
          setInputText();
        });

        SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
        CommonAssertions.assertAriaLiveMessage(
          SearchBoxSelectors.searchBoxAriaLive,
          expectedSum.toString()
        );
      });

      describe('after selecting a suggestion with the mouse', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();
          setInputText();
          SearchBoxSelectors.querySuggestions().eq(1).click();
        });

        SearchBoxAssertions.assertFocusSearchBox();
        SearchBoxAssertions.assertHasText('Recent query 1');
      });

      describe('after focusing a suggestion with the keyboard', () => {
        before(() => {
          setupWithSuggestionsAndRecentQueries();

          SearchBoxSelectors.inputBox().focus();
          const downKeys = Array(9).fill('{downarrow}').join('');
          SearchBoxSelectors.inputBox().type(`Rec${downKeys}`, {
            delay: 200,
            force: true,
          });
        });

        SearchBoxAssertions.assertHasText('Recent query 1');

        describe('after pressing the search button', () => {
          before(() => {
            SearchBoxSelectors.submitButton().click();
          });

          SearchBoxAssertions.assertHasText('Recent query 1');
        });
      });

      describe('with duplicate recent queries and suggestions', () => {
        function setupDuplicateRecentQueriesAndSuggestions() {
          new SafeStorage().setJSON(StorageItems.RECENT_QUERIES, [
            'duplicate',
            'unique',
          ]);

          new TestFixture()
            .with(() => {
              cy.intercept(
                {method: 'POST', path: '**/rest/search/v2/querySuggest?*'},
                (request) => {
                  request.reply((response) => {
                    const newResponse = response.body;
                    newResponse.completions = [
                      {
                        expression: 'duplicate',
                        executableConfidence: 0,
                        highlighted: 'duplicate',
                        score: 0,
                      },
                    ];
                    response.send(200, newResponse);
                  });
                }
              ).as(TestFixture.interceptAliases.QuerySuggestions.substring(1));
            })
            .with(
              addSearchBox({
                suggestions: {
                  maxWithoutQuery: maxSuggestionsWithoutQuery,
                  maxWithQuery: numOfSuggestions,
                },
                recentQueries: {
                  maxWithoutQuery: maxRecentQueriesWithoutQuery,
                  maxWithQuery: numOfRecentQueries,
                },
                props: {
                  'number-of-queries': numOfSuggestions + numOfRecentQueries,
                  'suggestion-timeout': 2000,
                },
              })
            )
            .init();
        }

        it('correctly shows recent queries when there is a match and no duplicate', () => {
          setupDuplicateRecentQueriesAndSuggestions();
          SearchBoxSelectors.inputBox().type('uniq');
          SearchBoxSelectors.recentQueriesItem().should('have.length', 1);
        });

        it('correctly hides recent queries when there is a match and there is a duplicate', () => {
          setupDuplicateRecentQueriesAndSuggestions();
          SearchBoxSelectors.inputBox().type('dupl');
          SearchBoxSelectors.recentQueriesItem().should('have.length', 0);
        });
      });
    });
  });

  describe('with no suggestions nor recentQueries', () => {
    before(() => {
      new TestFixture()
        .with(setSuggestions(0))
        .with(setRecentQueries(0))
        .with(addSearchBox())
        .init();
      SearchBoxSelectors.inputBox().click();
    });

    CommonAssertions.assertAriaLiveMessage(
      SearchBoxSelectors.searchBoxAriaLive,
      ' no '
    );
    CommonAssertions.assertAccessibility(searchBoxComponent);
  });

  describe('with a basic search box', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox())
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
      SearchBoxSelectors.inputBox().click();
      SearchBoxSelectors.inputBox().type('test{enter}', {force: true});
      cy.wait(RouteAlias.analytics);
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('with disableSearch set to true', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({props: {'disable-search': 'true'}}))
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
      SearchBoxSelectors.inputBox().click();
      SearchBoxSelectors.inputBox().type('test{enter}', {force: true});
      SearchBoxSelectors.submitButton().click({force: true});
    });

    SearchBoxAssertions.assertHasSuggestionsCount(0);
    SearchBoxAssertions.assertHasText('test');
    QuerySummaryAssertions.assertHasPlaceholder();
    CommonAssertions.assertConsoleError(false);
  });

  describe('with a facet & clear-filters set to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({props: {'clear-filters': 'false'}}))
        .with(addFacet({field}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      cy.wait(TestFixture.interceptAliases.Search);
      SearchBoxSelectors.submitButton().click({force: true});
      cy.wait(TestFixture.interceptAliases.Search);
    });

    FacetCommonAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      1
    );
  });

  describe('with a facet & clear-filters set to true', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({props: {'clear-filters': 'true'}}))
        .with(addFacet({field}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      cy.wait(TestFixture.interceptAliases.Search);
      SearchBoxSelectors.submitButton().click({force: true});
      cy.wait(TestFixture.interceptAliases.Search);
    });

    FacetCommonAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      0
    );
  });
});
