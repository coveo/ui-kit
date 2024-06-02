import {configure} from '../../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  mockQuerySuggestions,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {SearchBoxActions as Actions} from './search-box-actions';
import {SearchBoxExpectations as Expect} from './search-box-expectations';

const engineId = 'quantic-search-box-engine';
const recentQueriesLSKey = `LSKey[c]${engineId}_quantic-recent-queries`;

interface StandaloneSearchBoxOptions {
  engineId: string;
  placeholder: string;
  withoutSubmitButton: boolean;
  numberOfSuggestions: number;
  textarea: boolean;
  disableRecentQuerySuggestions: boolean;
}

const variants = [
  {variantName: 'default', textarea: false},
  {variantName: 'expandable', textarea: true},
];

function setRecentQueriesInLocalStorage(recentQueries: String[]) {
  window.localStorage.setItem(
    recentQueriesLSKey,
    JSON.stringify(recentQueries)
  );
}

const defaultOptions: Partial<StandaloneSearchBoxOptions> = {
  engineId,
};

describe('quantic-search-box', () => {
  const pageUrl = 's/quantic-search-box';

  function visitSearchBox(
    options: Partial<StandaloneSearchBoxOptions> = defaultOptions
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  variants.forEach(({variantName, textarea}) => {
    describe(`variant ${variantName} with default options`, () => {
      describe('recent query suggestions', () => {
        const exampleQuerySuggestions = ['ABC', 'EFG'];

        describe('when no recent query is found at initial state', () => {
          beforeEach(() => {
            setRecentQueriesInLocalStorage([]);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should display the suggestions in the right order and should not display recent query suggestions', () => {
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(false);
              Expect.numberOfQuerySuggestions(exampleQuerySuggestions.length);
              Expect.querySuggestionsEquals(exampleQuerySuggestions);
            });

            scope('when selecting a suggestions', () => {
              const clickedSuggestionIndex = 0;
              Actions.clickQuerySuggestion(clickedSuggestionIndex);

              Expect.searchWithQuery(
                exampleQuerySuggestions[clickedSuggestionIndex],
                {
                  LSkey: recentQueriesLSKey,
                  queries: [exampleQuerySuggestions[clickedSuggestionIndex]],
                }
              );
            });
          });
        });

        describe('when recent queries are found at initial state', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should display the suggestions and the recent query suggestions in the right order', () => {
            const expectedQuerySuggestions = [
              ...exampleRecentQueries,
              ...exampleQuerySuggestions,
            ];
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(expectedQuerySuggestions.length);
              Expect.querySuggestionsEquals(expectedQuerySuggestions);
            });

            scope('when selecting a recent query', () => {
              const clickedSuggestionIndex = 0;
              Actions.clickQuerySuggestion(clickedSuggestionIndex);

              Expect.searchWithQuery(
                exampleRecentQueries[clickedSuggestionIndex],
                {
                  LSkey: recentQueriesLSKey,
                  queries: exampleRecentQueries,
                }
              );
            });
          });
        });

        describe('when no query suggestions are returned and only recent queries are present', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions([]);
          });

          it('should display the recent query suggestions', () => {
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(exampleRecentQueries.length);
              Expect.querySuggestionsEquals(exampleRecentQueries);
            });
          });
        });

        describe('when the same suggestion is returned as a query suggestion and as a recent query suggestion', () => {
          const exampleRecentQueries = ['ABC'];
          const exampleQuerySuggestions = ['ABC'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should not display the same suggestion twice', () => {
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(exampleRecentQueries.length);
              Expect.querySuggestionsEquals(exampleRecentQueries);
            });
          });
        });

        describe('when a value is written in the search box input', () => {
          const exampleQuery = 'f';
          const allRecentQuerySuggestions = [
            'foo',
            'bar',
            'fill',
            'Fun',
            'baz',
          ];
          const expectedRecentQuerySuggestions = ['foo', 'fill', 'Fun'];
          const expectedDisplayedSuggestions = [
            ...expectedRecentQuerySuggestions,
            ...exampleQuerySuggestions,
          ];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(allRecentQuerySuggestions);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should only display the recent query suggestions that starts with the value written in the search box input', () => {
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when writing in the search box input', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);

              Actions.typeInSearchBox(exampleQuery, textarea);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(
                expectedDisplayedSuggestions.length
              );
              Expect.querySuggestionsEquals(expectedDisplayedSuggestions);
            });
          });
        });

        describe('when clearing the recent queries', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should clear the recent queries and send the right analytics', () => {
            const expectedQuerySuggestions = [
              ...exampleRecentQueries,
              ...exampleQuerySuggestions,
            ];
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(expectedQuerySuggestions.length);
              Expect.querySuggestionsEquals(expectedQuerySuggestions);
            });

            scope('when clicking on the clear recent queries button', () => {
              Actions.clickClearRecentQueriesButton();

              Expect.logClearRecentQueries();
              Expect.displayClearRecentQueriesButton(false);
              Expect.numberOfQuerySuggestions(exampleQuerySuggestions.length);
              Expect.querySuggestionsEquals(exampleQuerySuggestions);
            });

            scope('when selecting a query suggestion', () => {
              const clickedSuggestionIndex = 0;
              Actions.clickQuerySuggestion(clickedSuggestionIndex);
              Expect.searchWithQuery(
                exampleQuerySuggestions[clickedSuggestionIndex],
                {
                  LSkey: recentQueriesLSKey,
                  queries: [exampleQuerySuggestions[clickedSuggestionIndex]],
                }
              );
            });
          });
        });

        describe('when the property disableRecentQuerySuggestions is set to true', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({
              ...defaultOptions,
              textarea,
              disableRecentQuerySuggestions: true,
            });
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should display the suggestions without recent query suggestions', () => {
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(false);
              Expect.numberOfQuerySuggestions(exampleQuerySuggestions.length);
              Expect.querySuggestionsEquals(exampleQuerySuggestions);
            });
          });
        });

        describe('when using the keyboard to select a recent query', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should properly navigate and select the right suggestion', () => {
            const expectedQuerySuggestions = [
              ...exampleRecentQueries,
              ...exampleQuerySuggestions,
            ];
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(expectedQuerySuggestions.length);
              Expect.querySuggestionsEquals(expectedQuerySuggestions);
            });

            scope('when selecting a recent query with the keyboard', () => {
              // First arrow down press to go to the clear recent queries option.
              Actions.pressDownArrowOnSearchBox(textarea);
              // Second arrow down press to go to the first recent queries option.
              Actions.pressDownArrowOnSearchBox(textarea);
              Actions.pressEnterOnSearchBox(textarea);
              const clickedSuggestionIndex = 0;
              Expect.searchWithQuery(
                exampleRecentQueries[clickedSuggestionIndex],
                {
                  LSkey: recentQueriesLSKey,
                  queries: exampleRecentQueries,
                }
              );
            });
          });
        });

        describe('when using the keyboard to select a query suggestion', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({...defaultOptions, textarea});
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should properly navigate and select the right suggestion', () => {
            const expectedQuerySuggestions = [
              ...exampleRecentQueries,
              ...exampleQuerySuggestions,
            ];
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(expectedQuerySuggestions.length);
              Expect.querySuggestionsEquals(expectedQuerySuggestions);
            });

            scope('when selecting a recent query with the keyboard', () => {
              // First arrow down press to go to the clear recent queries option.
              Actions.pressDownArrowOnSearchBox(textarea);
              // pressing the arrow down button to surpass every recent query option.
              for (let i = 0; i < exampleRecentQueries.length + 1; i++) {
                Actions.pressDownArrowOnSearchBox(textarea);
              }

              Actions.pressEnterOnSearchBox(textarea);
              const clickedSuggestionIndex = 0;
              Expect.searchWithQuery(
                exampleQuerySuggestions[clickedSuggestionIndex],
                {
                  LSkey: recentQueriesLSKey,
                  queries: [
                    exampleQuerySuggestions[clickedSuggestionIndex],
                    ...exampleRecentQueries,
                  ],
                }
              );
            });
          });
        });

        describe('when a custom value is set for the property numberOfSuggestions', () => {
          const exampleRecentQueries = ['foo', 'bar'];
          const customNumberOfSuggestions = 3;

          beforeEach(() => {
            setRecentQueriesInLocalStorage(exampleRecentQueries);
            visitSearchBox({
              ...defaultOptions,
              textarea,
              numberOfSuggestions: customNumberOfSuggestions,
            });
            mockQuerySuggestions(exampleQuerySuggestions);
          });

          it('should limit the number of suggestions to display to respect the number of suggestions property', () => {
            const expectedQuerySuggestions = [
              ...exampleRecentQueries,
              ...exampleQuerySuggestions,
            ].slice(0, customNumberOfSuggestions);
            scope('when loading standalone search box', () => {
              Expect.displayInputSearchBox(true, textarea);
              Expect.displaySearchButton(true);
            });

            scope('when focusing on the search box input', () => {
              Actions.focusSearchBox(textarea);
              cy.wait(InterceptAliases.QuerySuggestions);

              Expect.displaySuggestionList(true);
              Expect.displayClearRecentQueriesButton(true);
              Expect.numberOfQuerySuggestions(customNumberOfSuggestions);
              Expect.querySuggestionsEquals(expectedQuerySuggestions);
            });
          });
        });

        describe('when a the property disableRecentQuerySuggestions is set to true', () => {
          const exampleRecentQueries = ['foo', 'bar'];

          describe('when the local storage contains recent query suggestions', () => {
            beforeEach(() => {
              setRecentQueriesInLocalStorage(exampleRecentQueries);
              visitSearchBox({
                ...defaultOptions,
                textarea,
                disableRecentQuerySuggestions: true,
              });
              mockQuerySuggestions(exampleQuerySuggestions);
            });

            it('should not display the recent query suggestions', () => {
              const expectedQuerySuggestions = exampleQuerySuggestions;

              scope('when loading standalone search box', () => {
                Expect.displayInputSearchBox(true, textarea);
                Expect.displaySearchButton(true);
              });

              scope('when focusing on the search box input', () => {
                Actions.focusSearchBox(textarea);
                cy.wait(InterceptAliases.QuerySuggestions);

                Expect.displaySuggestionList(true);
                Expect.displayClearRecentQueriesButton(false);
                Expect.numberOfQuerySuggestions(
                  expectedQuerySuggestions.length
                );
                Expect.querySuggestionsEquals(expectedQuerySuggestions);
              });
            });
          });

          describe('when the local storage does not contain recent query suggestions', () => {
            beforeEach(() => {
              setRecentQueriesInLocalStorage([]);
              visitSearchBox({
                ...defaultOptions,
                textarea,
                disableRecentQuerySuggestions: true,
              });
              mockQuerySuggestions(exampleQuerySuggestions);
            });

            it('should not add the query to the local storage after executing a new search', () => {
              const expectedQuerySuggestions = exampleQuerySuggestions;

              scope('when loading standalone search box', () => {
                Expect.displayInputSearchBox(true, textarea);
                Expect.displaySearchButton(true);
              });

              scope('when focusing on the search box input', () => {
                Actions.focusSearchBox(textarea);
                cy.wait(InterceptAliases.QuerySuggestions);

                Expect.displaySuggestionList(true);
                Expect.displayClearRecentQueriesButton(false);
                Expect.numberOfQuerySuggestions(
                  expectedQuerySuggestions.length
                );
                Expect.querySuggestionsEquals(expectedQuerySuggestions);
              });

              scope('when selecting a suggestions', () => {
                const clickedSuggestionIndex = 0;
                Actions.clickQuerySuggestion(clickedSuggestionIndex);

                Expect.searchWithQuery(
                  exampleQuerySuggestions[clickedSuggestionIndex],
                  {
                    LSkey: recentQueriesLSKey,
                    queries: [],
                  }
                );
              });
            });
          });
        });
      });
    });
  });
});
