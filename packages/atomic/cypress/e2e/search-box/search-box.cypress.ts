import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
} from '../../../src/components/search/search-box-suggestions/suggestions-common';
import {
  SafeStorage,
  StorageItems,
} from '../../../src/utils/local-storage-utils';
import {RouteAlias} from '../../fixtures/fixture-common';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import * as CommonAssertions from '../common-assertions';
import {selectIdleCheckboxValueAt} from '../facets/facet-common-actions';
import * as FacetCommonAssertions from '../facets/facet-common-assertions';
import {addFacet, field} from '../facets/facet/facet-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';
import {addQuerySummary} from '../query-summary-actions';
import * as QuerySummaryAssertions from '../query-summary-assertions';
import {
  resultTextComponent,
  ResultTextSelectors,
} from '../result-list/result-components/result-text-selectors';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list/result-list-actions';
import {ResultListSelectors} from '../result-list/result-list-selectors';
import {addSearchBox, typeSearchInput} from './search-box-actions';
import * as SearchBoxAssertions from './search-box-assertions';
import {searchBoxComponent, SearchBoxSelectors} from './search-box-selectors';

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

    function setupSearchbox() {
      return addSearchBox({
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
      });
    }

    function setupSearchboxOnly() {
      return addSearchBox({
        suggestions: {
          maxWithoutQuery: 0,
          maxWithQuery: 0,
        },
        recentQueries: {
          maxWithoutQuery: 0,
          maxWithQuery: 0,
        },
        props: {
          'number-of-queries': 0,
          'suggestion-timeout': 2000,
        },
      });
    }

    function setupWithSuggestionsAndRecentQueries() {
      new TestFixture()
        .with(setSuggestions(numOfSuggestions))
        .with(setRecentQueries(numOfRecentQueries))
        .with(setupSearchbox())
        .init();
    }

    function setupWithRecentQueries() {
      new TestFixture()
        .with(setRecentQueries(numOfRecentQueries))
        .with(setupSearchbox())
        .init();
    }

    describe('without input', () => {
      const expectedSum =
        maxSuggestionsWithoutQuery + maxRecentQueriesWithoutQuery;

      beforeEach(() => {
        setupWithSuggestionsAndRecentQueries();
        SearchBoxSelectors.inputBox().click();
      });

      it('is setup with expected suggestions', () => {
        SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);
      });

      it('is accessible', () => {
        CommonAssertions.assertAccessibility(searchBoxComponent);
        CommonAssertions.assertAriaLiveMessage(
          SearchBoxSelectors.searchBoxAriaLive,
          expectedSum.toString()
        );
      });
    });

    describe('when changing the redirection-url prop, re-initializing the search box', () => {
      beforeEach(() => {
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
        SearchBoxSelectors.querySuggestion('query-suggestion-1').click();
      });

      SearchBoxAssertions.assertHasText('query-suggestion-1');
    });

    describe('analytics', () => {
      it('should log interface load with a correct number of results for query that return only one result', () => {
        new TestFixture()
          .with(setupSearchboxOnly())
          .withHash('q=singhr65')
          .init();

        cy.expectSearchEvent('interfaceLoad').should((analyticsBody) => {
          expect(analyticsBody.numberOfResults).to.equal(1);
        });
      });

      it('should log the correct results array for a query that return only one result', () => {
        new TestFixture()
          .with(setupSearchboxOnly())
          .with(addResultList())
          .withHash('q=singhr65')
          .init();

        cy.expectSearchEvent('interfaceLoad').should((analyticsBody) => {
          const resultsArray = analyticsBody.results;

          expect(resultsArray?.length).equal(1);
        });

        ResultListSelectors.result().should('have.length', 1);
      });

      it('should log interface load with a correct number of results for a query that return multiple results', () => {
        new TestFixture().with(setupSearchboxOnly()).withHash('q=test').init();

        cy.expectSearchEvent('interfaceLoad').should((analyticsBody) => {
          expect(analyticsBody.numberOfResults).to.be.greaterThan(1000);
        });
      });

      it('should log the correct results array for a query that return 10 results', () => {
        new TestFixture()
          .with(setupSearchboxOnly())
          .with(addResultList())
          .withHash('q=test')
          .init();

        cy.expectSearchEvent('interfaceLoad').should((analyticsBody) => {
          const resultsArray = analyticsBody.results;

          expect(resultsArray?.length).equal(10);
        });

        ResultListSelectors.result().should('have.length', 10);
      });

      it('should log search box submit with a correct number of results when the query changes', () => {
        new TestFixture()
          .with(setupSearchboxOnly())
          .withHash('q=singhr65')
          .init();

        SearchBoxSelectors.inputBox().clear();
        SearchBoxSelectors.inputBox().type('test', {force: true, delay: 100});
        SearchBoxSelectors.submitButton().click();

        cy.expectSearchEvent('searchboxSubmit').should((analyticsBody) => {
          expect(analyticsBody.numberOfResults).to.be.greaterThan(1000);
        });
      });
    });

    describe('with input', () => {
      const expectedSum = numOfSuggestions + numOfRecentQueries;

      describe('verify rendering', () => {
        beforeEach(() => {
          setupWithSuggestionsAndRecentQueries();
          SearchBoxSelectors.inputBox().type('Rec', {delay: 100});
        });

        SearchBoxAssertions.assertHasSuggestionsCount(expectedSum);

        CommonAssertions.assertAriaLiveMessage(
          SearchBoxSelectors.searchBoxAriaLive,
          expectedSum.toString()
        );
      });

      describe('with custom suggestions provider', () => {
        beforeEach(() => {
          // Disable "standard" query suggestion components to display only custom ones
          new TestFixture()
            .with(
              addSearchBox({
                suggestions: {
                  maxWithoutQuery: 0,
                  maxWithQuery: 0,
                },
                props: {
                  'number-of-queries': 50,
                },
              })
            )
            .init();
        });

        const registerFakeSuggestionComponent = (
          title: string,
          query: string,
          numItem = 1
        ) => {
          SearchBoxSelectors.host().then(($el) => {
            const searchBoxElement = $el.get(0);

            dispatchSearchBoxSuggestionsEvent(() => {
              return {
                position: 0,
                renderItems: () => [
                  fakeSuggestionSectionTitle(title),

                  ...Array.from(Array(numItem).keys()).map((i) =>
                    fakeSuggestionItem(`${query}_${i}`, `${query}_${i}`)
                  ),
                ],
              };
            }, searchBoxElement);
          });
        };

        const fakeSuggestionItem = (content: string, query?: string) => {
          return {
            content: content as unknown,
            key: content,
            query,
          } as SearchBoxSuggestionElement;
        };

        const fakeSuggestionSectionTitle = (content: string) =>
          fakeSuggestionItem(content);

        it('should display the custom suggestions', () => {
          const firstSuggestionsLen = 5;
          const secondSuggestionsLen = 10;
          const firstSuggestionsText = 'some suggestion';
          const secondSuggestionsText = 'another suggestion';

          registerFakeSuggestionComponent(
            'the first title',
            firstSuggestionsText,
            firstSuggestionsLen
          );

          registerFakeSuggestionComponent(
            'the second title',
            secondSuggestionsText,
            secondSuggestionsLen
          );
          SearchBoxSelectors.inputBox().focus();

          Array.from(Array(firstSuggestionsLen).keys()).forEach((i) => {
            SearchBoxSelectors.shadow()
              .find('button[part~="suggestion-with-query"]')
              .should('contain.text', `${firstSuggestionsText}_${i}`);
          });
          Array.from(Array(secondSuggestionsLen).keys()).forEach((i) => {
            SearchBoxSelectors.shadow()
              .find('button[part~="suggestion-with-query"]')
              .should('contain.text', `${secondSuggestionsText}_${i}`);
          });
        });

        it('should not remove title with no queries associated', () => {
          // In this particular test, we are trying to verify that we do not
          // remove duplicates elements for the same empty `query` property on a suggestion.
          // Since the custom search box suggestion system does not enforce the query property (it's optional),
          // it's a system that custom search box suggestions component will use to provide a "title" or separator section.
          // We don't want to detect multiple separator section with no query as duplicate

          registerFakeSuggestionComponent('the first title', 'some suggestion');
          registerFakeSuggestionComponent(
            'the second title',
            'another suggestion'
          );
          SearchBoxSelectors.inputBox().focus();

          SearchBoxSelectors.shadow()
            .find('[part="suggestion"]')
            .should('contain.text', 'the first title')
            .should('contain.text', 'the second title');
        });
      });

      describe('after selecting a suggestion with the mouse focuses search box with recent query', () => {
        beforeEach(() => {
          setupWithRecentQueries();
          SearchBoxSelectors.inputBox().focus();
          SearchBoxSelectors.querySuggestion('Recent query 1').click();
        });

        SearchBoxAssertions.assertFocusSearchBox();
        SearchBoxAssertions.assertHasText('Recent query 1');
      });

      describe('after focusing a suggestion with the keyboard', () => {
        beforeEach(() => {
          setupWithSuggestionsAndRecentQueries();
          SearchBoxSelectors.inputBox().focus();
          const downKeys = Array(9).fill('{downarrow}').join('');
          SearchBoxSelectors.inputBox().type(`Rec${downKeys}`, {
            delay: 200,
            force: true,
          });
        });

        it('has recent query', () => {
          SearchBoxAssertions.assertHasText('Recent query 1');
        });

        it('still has recent query after pressing the search button', () => {
          SearchBoxSelectors.submitButton().click();
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
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(0))
        .with(setRecentQueries(0))
        .with(addSearchBox())
        .init();
    });

    it('should be accessible', () => {
      SearchBoxSelectors.inputBox().click();
      CommonAssertions.assertAriaLiveMessage(
        SearchBoxSelectors.searchBoxAriaLive,
        ' no '
      );
      CommonAssertions.assertAccessibility(searchBoxComponent);
    });
  });

  describe('with default search box', () => {
    const numOfSuggestions = 6;
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox())
        .with(addQuerySummary())
        .with(setSuggestions(numOfSuggestions))
        .withoutFirstAutomaticSearch()
        .init();
      SearchBoxSelectors.inputBox().click();
      SearchBoxSelectors.inputBox().type('test{enter}', {force: true});
      cy.wait(RouteAlias.UA);
    });

    it('search button is enabled to start with', () => {
      SearchBoxSelectors.inputBox().should('be.empty');
      SearchBoxSelectors.submitButton().should('be.enabled');
    });

    it('should provide suggestions when focusing the search box', () => {
      SearchBoxSelectors.inputBox().focus();
      SearchBoxSelectors.querySuggestions().should('exist');
      SearchBoxSelectors.querySuggestions()
        .should('have.attr', 'part')
        .and('not.contain', 'active-suggestion');

      SearchBoxSelectors.querySuggestions().eq(0).trigger('mouseover');
      SearchBoxSelectors.querySuggestions()
        .eq(0)
        .should('have.attr', 'part')
        .and('contain', 'active-suggestion');
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('with disableSearch set to true', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addSearchBox({
            props: {
              'disable-search': 'true',
              'minimum-query-length': 1, // disable-search should override this setting
            },
          })
        )
        .with(addQuerySummary())
        .withoutFirstAutomaticSearch()
        .init();
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(searchBoxComponent);
    });

    it('there are no search suggestions or errors on query input', () => {
      typeSearchInput('test');
      SearchBoxSelectors.submitButton().should('be.disabled');
      SearchBoxAssertions.assertNoSuggestionGenerated();
      QuerySummaryAssertions.assertHasPlaceholder();
      CommonAssertions.assertConsoleError(false);
    });
  });

  describe('with minimum query length to enable search', () => {
    const testQuery = 'test';
    const numOfSuggestions = 2;
    const minimumQueryLength = testQuery.length;
    beforeEach(() => {
      new TestFixture()
        .with(setSuggestions(numOfSuggestions))
        .with(
          addSearchBox({
            props: {'minimum-query-length': minimumQueryLength},
          })
        )
        .init();
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(searchBoxComponent);
    });

    it('search button is enabled when a query with minimum length is input', () => {
      typeSearchInput(testQuery.slice(0, minimumQueryLength - 1)); // enter query less than min len
      SearchBoxSelectors.submitButton().should('be.disabled');
      SearchBoxAssertions.assertNoSuggestionGenerated();

      typeSearchInput(testQuery.slice(minimumQueryLength - 1)); // enter rest of the query
      SearchBoxSelectors.submitButton().should('not.be.disabled');

      typeSearchInput('{downarrow}'.repeat(numOfSuggestions));
      SearchBoxAssertions.assertHasSuggestionsCount(numOfSuggestions);
      SearchBoxAssertions.assertSuggestionIsSelected(numOfSuggestions);
    });

    it('search button is disabled when query is deleted', () => {
      typeSearchInput(testQuery);
      SearchBoxSelectors.submitButton().should('not.be.disabled');

      typeSearchInput('{backspace}'.repeat(minimumQueryLength), '');
      SearchBoxSelectors.submitButton().should('be.disabled');
    });
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

  describe('with the query syntax enabled', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addSearchBox({props: {'enable-query-syntax': ''}}))
        .with(
          addResultList(
            buildTemplateWithoutSections(
              generateComponentHTML(resultTextComponent, {field: 'title'})
            )
          )
        )
        .withoutFirstAutomaticSearch()
        .init();
    });

    it('uses the query syntax', () => {
      SearchBoxSelectors.inputBox().type('@urihash=Wl1SZoqFsR8bpsbG');
      SearchBoxSelectors.submitButton().click();
      ResultTextSelectors.firstInResult().should('have.text', 'bushy lichens');
    });
  });
});
