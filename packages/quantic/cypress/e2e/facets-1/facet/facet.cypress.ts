import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  extractFacetValues,
  getQueryAlias,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
  interceptSearchWithError,
  mockFacetSearchSingleValue,
  mockNoMoreFacetValues,
  routeMatchers,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {FacetActions as Actions} from './facet-actions';
import {FacetExpectations as Expect} from './facet-expectations';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
  isCollapsed: boolean;
  displayValuesAs: string;
  useCase: string;
}

describe('Facet Test Suite', () => {
  const pageUrl = 's/quantic-facet';

  const defaultField = 'objecttype';
  const defaultLabel = 'Type';
  const defaultNumberOfValues = 8;

  const indexFacetValuesAlias = '@indexFacetValues';

  function visitFacetPage(
    options: Partial<FacetOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();

    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  function loadFromUrlHash(
    options: Partial<FacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();

    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  function aliasFacetValues(useCase: string) {
    cy.wait(getQueryAlias(useCase)).then((interception) => {
      const indexValues = extractFacetValues(interception.response);
      cy.wrap(indexValues).as(indexFacetValuesAlias.substring(1));
    });
  }

  function searchForFacetValue(singleValueQuery: string) {
    Actions.typeQueryInSearchInput(singleValueQuery);
    for (let i = 0; i < singleValueQuery.length; i++) {
      cy.wait(InterceptAliases.FacetSearch);
    }
  }

  function setupWithSingleFacetSearchValue(
    singleValueQuery: string,
    options: Partial<FacetOptions> = {}
  ) {
    cy.intercept('POST', routeMatchers.search).as(
      InterceptAliases.Search.substring(1)
    );
    mockFacetSearchSingleValue(singleValueQuery);

    cy.visit(pageUrl);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('with default settings', () => {
        it('should work as expected', () => {
          scope('when loading', () => {
            function setupWithPauseBeforeSearch() {
              interceptSearchIndefinitely();
              cy.visit(pageUrl);
              configure({
                field: defaultField,
                label: defaultLabel,
                numberOfValues: defaultNumberOfValues,
                useCase: param.useCase,
              });
              if (param.useCase === useCaseEnum.insight) {
                InsightInterfaceExpect.isInitialized();
                performSearch();
              }
            }
            setupWithPauseBeforeSearch();
            Expect.displayPlaceholder(true);
          });

          scope('when search returns an error', () => {
            function setupWithError() {
              interceptSearchWithError();
              cy.visit(pageUrl);
              configure({
                field: defaultField,
                label: defaultLabel,
                numberOfValues: defaultNumberOfValues,
                useCase: param.useCase,
              });
            }
            setupWithError();

            Expect.displayPlaceholder(false);
            Expect.displayValues(false);
            Expect.displayClearButton(false);
            Expect.displayShowMoreButton(false);
            Expect.displayShowLessButton(false);
            Expect.displaySearchInput(false);
          });
        });
      });

      describe('with values', () => {
        function setupWithValues() {
          visitFacetPage(
            {
              field: defaultField,
              label: defaultLabel,
              numberOfValues: defaultNumberOfValues,
              useCase: param.useCase,
            },
            false
          );
        }

        function setupWithNoMoreValues() {
          mockNoMoreFacetValues(defaultField, param.useCase);
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: defaultNumberOfValues,
            useCase: param.useCase,
            noSearch: param.useCase !== useCaseEnum.search,
          });
        }

        function searchForValue(query: string) {
          setupWithValues();
          Actions.typeQueryInSearchInput(query);
        }

        it('should work as expected', () => {
          setupWithValues();

          scope('when loading', () => {
            Expect.displayPlaceholder(false);
            Expect.labelContains(defaultLabel);
            Expect.displayValues(true);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
            Expect.displayClearButton(false);
            Expect.displayShowMoreButton(true);
            Expect.displayShowLessButton(false);
            Expect.displaySearchInput(true);

            aliasFacetValues(param.useCase);
            Expect.facetValuesEqual(indexFacetValuesAlias);
          });

          scope('when selecting a value', () => {
            function selectFirstFacetValue() {
              Actions.checkFirstValue();
            }

            function collapseFacet() {
              Actions.clickCollapseButton();
              cy.wait(getQueryAlias(param.useCase));
            }

            selectFirstFacetValue();
            Expect.clearFilterContains('Clear filter');
            Expect.numberOfSelectedCheckboxValues(1);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            Expect.logFacetSelect(defaultField, 0);

            scope('when collapsing the facet', () => {
              collapseFacet();

              Expect.displayClearButton(true);
              Expect.clearFilterContains('Clear filter');
            });

            scope('when selecting the "Clear" button', () => {
              function clearSelectedValues() {
                Actions.clickExpandButton();
                Actions.clickClearFilter();
                cy.wait(getQueryAlias(param.useCase));
              }
              clearSelectedValues();

              Expect.displayClearButton(false);
              Expect.numberOfSelectedCheckboxValues(0);
              Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
              Expect.logClearFacetValues(defaultField);
            });

            scope('when selecting a second value', () => {
              const initialNumberOfSelectedValues = 2;
              function selectTwoValues() {
                Actions.checkFirstValue();
                Expect.logFacetSelect(defaultField, 0);
                Actions.checkLastValue();
              }

              selectTwoValues();

              Expect.clearFilterContains('Clear 2 filters');
              Expect.numberOfSelectedCheckboxValues(
                initialNumberOfSelectedValues
              );
              Expect.numberOfIdleCheckboxValues(
                defaultNumberOfValues - initialNumberOfSelectedValues
              );

              Expect.logFacetSelect(defaultField, 1);

              scope('when collapsing the facet', () => {
                collapseFacet();

                Expect.displayClearButton(true);
                Expect.clearFilterContains('Clear 2 filters');
              });
            });
          });

          if (param.useCase === useCaseEnum.search) {
            scope('when searching for a value that returns results', () => {
              const query = 'a';
              searchForValue(query);

              Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
              Expect.numberOfSelectedCheckboxValues(0);
              Expect.displayMoreMatchesFound(true);
              Expect.displayNoMatchesFound(false);
              Expect.moreMatchesFoundContainsQuery(query);
              Expect.displayShowMoreButton(false);
              Expect.displaySearchClearButton(true);
              Expect.highlightsResults(query);
            });

            scope('when clearing the facet search results', () => {
              function clearSearchInput() {
                Actions.clickSearchClearButton();
              }
              clearSearchInput();

              Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
              Expect.numberOfSelectedCheckboxValues(0);
              Expect.displayMoreMatchesFound(false);
              Expect.displayNoMatchesFound(false);
              Expect.displayShowMoreButton(true);
              Expect.displayShowLessButton(false);
              Expect.searchInputEmpty();
              Expect.displaySearchClearButton(false);
            });

            scope('when searching for a value that returns no results', () => {
              const query = 'this facet value does not exist';

              Actions.typeQueryInSearchInput(query);

              Expect.numberOfIdleCheckboxValues(0);
              Expect.numberOfSelectedCheckboxValues(0);
              Expect.displayMoreMatchesFound(false);
              Expect.displayNoMatchesFound(true);
              Expect.noMatchesFoundContainsQuery(query);
              Expect.displaySearchClearButton(true);
            });

            scope('when selecting a search result', () => {
              function selectSearchResult() {
                Actions.clickSearchClearButton();
                searchForFacetValue('account');
                Actions.checkFirstValue();
              }
              selectSearchResult();

              Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
              Expect.numberOfSelectedCheckboxValues(1);
              Expect.displayMoreMatchesFound(false);
              Expect.displayNoMatchesFound(false);
              Expect.displayShowMoreButton(true);
              Expect.displaySearchInput(true);
              Expect.displaySearchClearButton(false);
              Expect.logFacetSelect(defaultField, 0);
            });
            scope('when collapsing a facet', () => {
              function collapseFacet() {
                Actions.clickClearFilter();
                Actions.clickCollapseButton();
              }

              collapseFacet();

              Expect.labelContains(defaultLabel);
              Expect.displayExpandButton(true);
              Expect.displaySearchInput(false);
              Expect.numberOfIdleCheckboxValues(0);
              Expect.displayShowMoreButton(false);

              scope('when expanding a facet', () => {
                function expandFacet() {
                  Actions.clickExpandButton();
                }

                expandFacet();

                Expect.labelContains(defaultLabel);
                Expect.displayCollapseButton(true);
                Expect.displaySearchInput(true);
                Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
                Expect.displayShowMoreButton(true);
              });
            });
          }
        });

        if (param.useCase === useCaseEnum.search) {
          it('should work as expected', () => {
            scope(
              'when searching for a value that returns a single result',
              () => {
                const queryValue = 'account';

                setupWithSingleFacetSearchValue(queryValue);
                searchForFacetValue(queryValue);

                Expect.numberOfIdleCheckboxValues(1);
                Expect.numberOfSelectedCheckboxValues(0);
                Expect.displayMoreMatchesFound(false);
                Expect.displayNoMatchesFound(false);
                Expect.displaySearchClearButton(true);
              }
            );
          });
        }

        it('should show more/less values', () => {
          scope('when clicking show more values', () => {
            const smallNumberOfValues = 2;

            function showMoreValues() {
              visitFacetPage({
                field: defaultField,
                label: defaultLabel,
                numberOfValues: smallNumberOfValues,
                useCase: param.useCase,
              });
              Actions.clickShowMoreButton();
            }
            showMoreValues();
            Expect.numberOfValues(smallNumberOfValues * 2);
            aliasFacetValues(param.useCase);
            Expect.facetValuesEqual(indexFacetValuesAlias);

            scope('when clicking show more button again', () => {
              function showMoreValuesAgain() {
                Actions.clickShowMoreButton();
              }

              showMoreValuesAgain();
              Expect.numberOfValues(smallNumberOfValues * 3);
              aliasFacetValues(param.useCase);
              Expect.facetValuesEqual(indexFacetValuesAlias);

              scope('when clicking show less button', () => {
                function showLessValues() {
                  Actions.clickShowLessButton();
                }

                showLessValues();
                Expect.numberOfValues(smallNumberOfValues);
                aliasFacetValues(param.useCase);
                Expect.facetValuesEqual(indexFacetValuesAlias);
              });
            });
            scope('when facet has no more values', () => {
              setupWithNoMoreValues();

              Expect.displayValues(true);
              Expect.displayShowMoreButton(false);
              Expect.displayShowLessButton(false);
            });
          });
          scope('when there is no more facet values to show', () => {
            Expect.displayPlaceholder(false);
            Expect.labelContains(defaultLabel);
            Expect.displayValues(true);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.displayClearButton(false);
            Expect.displayShowMoreButton(false);
            Expect.displayShowLessButton(false);
            Expect.displaySearchInput(false);
          });
        });
      });

      describe('with link values', () => {
        const linkValueOptions = {
          field: defaultField,
          label: defaultLabel,
          displayValuesAs: 'link',
          useCase: param.useCase,
        };

        function setupWithLinkValues() {
          visitFacetPage(linkValueOptions, false);
        }

        function setupWithNoMoreValues() {
          mockNoMoreFacetValues(defaultField, param.useCase);
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: defaultNumberOfValues,
            displayValuesAs: 'link',
            useCase: param.useCase,
          });
        }

        it('should work as expected', () => {
          scope('when loading', () => {
            setupWithLinkValues();

            Expect.displayPlaceholder(false);
            Expect.labelContains(defaultLabel);
            Expect.displayValues(true);
            Expect.hasCheckbox(false);
            Expect.numberOfSelectedLinkValues(0);
            Expect.numberOfIdleLinkValues(defaultNumberOfValues);
            Expect.displayClearButton(false);
            Expect.displayShowMoreButton(true);
            Expect.displayShowLessButton(false);
            Expect.displaySearchInput(true);

            aliasFacetValues(param.useCase);
            Expect.facetValuesEqual(indexFacetValuesAlias);
          });

          scope('when selecting a value', () => {
            function selectFirstFacetValue() {
              Actions.selectFirstLinkValue();
            }

            function collapseFacet() {
              Actions.clickCollapseButton();
            }

            selectFirstFacetValue();

            Expect.clearFilterContains('Clear filter');
            Expect.numberOfSelectedLinkValues(1);
            Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
            Expect.logFacetSelect(defaultField, 0);

            scope('when collapsing the facet', () => {
              collapseFacet();

              Expect.displayClearButton(true);
              Expect.clearFilterContains('Clear filter');
            });

            scope('when selecting the "Clear" button', () => {
              function clearSelectedValues() {
                Actions.clickExpandButton();
                Actions.clickClearFilter();
                cy.wait(getQueryAlias(param.useCase));
              }

              clearSelectedValues();

              Expect.displayClearButton(false);
              Expect.numberOfSelectedLinkValues(0);
              Expect.numberOfIdleLinkValues(defaultNumberOfValues);
              Expect.logClearFacetValues(defaultField);
            });

            scope('when selecting a second value', () => {
              function selectLastFacetValue() {
                selectFirstFacetValue();
                Expect.logFacetSelect(defaultField, 0);
                Actions.selectLastLinkValue();
              }

              selectLastFacetValue();

              Expect.clearFilterContains('Clear filter');
              Expect.numberOfSelectedLinkValues(1);
              Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
              Expect.logFacetSelect(defaultField, 0);

              scope('when collapsing the facet', () => {
                selectLastFacetValue();
                collapseFacet();

                Expect.clearFilterContains('Clear filter');
              });
            });
          });

          if (param.useCase === useCaseEnum.search) {
            scope('when searching for a value that returns results', () => {
              const query = 'a';
              setupWithLinkValues();

              function searchForValue() {
                Actions.typeQueryInSearchInput(query);
              }

              searchForValue();

              Expect.numberOfIdleLinkValues(defaultNumberOfValues);
              Expect.numberOfSelectedLinkValues(0);
              Expect.displayMoreMatchesFound(true);
              Expect.displayNoMatchesFound(false);
              Expect.moreMatchesFoundContainsQuery(query);
              Expect.displayShowMoreButton(false);
              Expect.displaySearchClearButton(true);
              Expect.highlightsResults(query);

              scope('when clearing the facet search results', () => {
                function clearSearchInput() {
                  Actions.clickSearchClearButton();
                }
                clearSearchInput();

                Expect.numberOfIdleLinkValues(defaultNumberOfValues);
                Expect.numberOfSelectedLinkValues(0);
                Expect.displayMoreMatchesFound(false);
                Expect.displayNoMatchesFound(false);
                Expect.displayShowMoreButton(true);
                Expect.displayShowLessButton(false);
                Expect.searchInputEmpty();
                Expect.displaySearchClearButton(false);
              });

              scope('when selecting a search result', () => {
                function selectSearchResult() {
                  searchForValue();
                  Actions.selectFirstLinkValue();
                  cy.wait(InterceptAliases.UA.Facet.Select);
                }

                selectSearchResult();

                Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
                Expect.numberOfSelectedLinkValues(1);
                Expect.displayMoreMatchesFound(false);
                Expect.displayNoMatchesFound(false);
                Expect.displayShowMoreButton(true);
                Expect.displaySearchInput(true);
                Expect.displaySearchClearButton(false);
                Expect.logFacetSelect(defaultField, 0);

                scope('when selecting a second search result', () => {
                  const secondQuery = 'Contact';
                  function selectOtherSearchResult() {
                    Actions.typeQueryInSearchInput(secondQuery);
                    Actions.selectFirstLinkValue();
                    cy.wait(InterceptAliases.UA.Facet.Select);
                  }

                  function selectASecondSearchResult() {
                    selectOtherSearchResult();
                  }

                  selectASecondSearchResult();

                  Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
                  Expect.numberOfSelectedLinkValues(1);
                  Expect.selectedValuesContain(secondQuery);
                  Expect.displayMoreMatchesFound(false);
                  Expect.displayNoMatchesFound(false);
                  Expect.displayShowMoreButton(true);
                  Expect.displaySearchInput(true);
                  Expect.displaySearchClearButton(false);
                  Expect.logFacetSelect(defaultField, 0);
                });
              });

              scope(
                'when searching for a value that returns no results',
                () => {
                  const query = 'this facet value does not exist';

                  Actions.typeQueryInSearchInput(query);

                  Expect.numberOfIdleLinkValues(0);
                  Expect.numberOfSelectedLinkValues(0);
                  Expect.displayMoreMatchesFound(false);
                  Expect.displayNoMatchesFound(true);
                  Expect.noMatchesFoundContainsQuery(query);
                  Expect.displaySearchClearButton(true);
                }
              );
            });

            scope('when collapsing a facet', () => {
              function collapseFacet() {
                Actions.clickCollapseButton();
              }
              collapseFacet();

              Expect.labelContains(defaultLabel);
              Expect.displayExpandButton(true);
              Expect.displaySearchInput(false);
              Expect.numberOfIdleLinkValues(0);
              Expect.displayShowMoreButton(false);

              scope('when expanding a facet', () => {
                function expandFacet() {
                  Actions.clickClearFilter();
                  Actions.clickExpandButton();
                }
                expandFacet();

                Expect.labelContains(defaultLabel);
                Expect.displayCollapseButton(true);
                Expect.displaySearchInput(true);
                Expect.numberOfIdleLinkValues(defaultNumberOfValues);
                Expect.displayShowMoreButton(true);
              });
            });
          }
        });

        if (param.useCase === useCaseEnum.search) {
          it('should work as expected', () => {
            scope(
              'when searching for a value that returns a single result',
              () => {
                const queryValue = 'account';

                setupWithSingleFacetSearchValue(queryValue, linkValueOptions);
                searchForFacetValue(queryValue);

                Expect.numberOfIdleLinkValues(1);
                Expect.numberOfSelectedLinkValues(0);
                Expect.displayMoreMatchesFound(false);
                Expect.displayNoMatchesFound(false);
                Expect.displaySearchClearButton(true);
              }
            );
          });
        }

        it('should show more/less values', () => {
          scope('when clicking show more values', () => {
            const smallNumberOfValues = 2;

            function showMoreValues() {
              visitFacetPage({
                field: defaultField,
                label: defaultLabel,
                numberOfValues: smallNumberOfValues,
                useCase: param.useCase,
                noSearch: param.useCase !== useCaseEnum.search,
              });
              Actions.clickShowMoreButton();
            }

            showMoreValues();
            Expect.numberOfValues(smallNumberOfValues * 2);
            aliasFacetValues(param.useCase);
            Expect.facetValuesEqual(indexFacetValuesAlias);

            scope('when clicking show more button again', () => {
              function showMoreValuesAgain() {
                Actions.clickShowMoreButton();
              }

              showMoreValuesAgain();
              Expect.numberOfValues(smallNumberOfValues * 3);
              aliasFacetValues(param.useCase);
              Expect.facetValuesEqual(indexFacetValuesAlias);

              scope('when clicking show less button', () => {
                function showLessValues() {
                  showMoreValuesAgain();
                  cy.wait(getQueryAlias(param.useCase));
                  Actions.clickShowLessButton();
                }

                showLessValues();
                Expect.numberOfValues(smallNumberOfValues);
                aliasFacetValues(param.useCase);
                Expect.facetValuesEqual(indexFacetValuesAlias);
              });
            });
          });

          scope('with no more facet values to show', () => {
            setupWithNoMoreValues();

            Expect.displayPlaceholder(false);
            Expect.labelContains(defaultLabel);
            Expect.displayValues(true);
            Expect.displayClearButton(false);
            Expect.displayShowMoreButton(false);
            Expect.displayShowLessButton(false);
            Expect.displaySearchInput(false);
          });
        });
      });

      describe('with custom field, label, and number of results', () => {
        function setupCustomOptions() {
          visitFacetPage(
            {
              field: 'language',
              label: 'Language',
              numberOfValues: 3,
              useCase: param.useCase,
            },
            false
          );
          aliasFacetValues(param.useCase);
        }

        it('should render correctly', () => {
          setupCustomOptions();

          Expect.labelContains('Language');
          Expect.numberOfIdleCheckboxValues(3);
          Expect.facetValuesEqual(indexFacetValuesAlias);
        });
      });

      describe('when field returns no results', () => {
        before(() => {
          visitFacetPage({
            field: 'somethingthatdoesnotexist',
            useCase: param.useCase,
          });
        });

        it('should render correctly', () => {
          Expect.displayLabel(false);
        });
      });

      describe('with custom sorting', () => {
        ['automatic', 'score', 'alphanumeric', 'occurrences'].forEach(
          (sorting) => {
            it(`should use "${sorting}" sorting in the facet request`, () => {
              visitFacetPage(
                {
                  sortCriteria: sorting,
                  useCase: param.useCase,
                },
                false
              );
              cy.wait(getQueryAlias(param.useCase)).then((interception) => {
                const facetRequest = interception.request.body.facets[0];
                expect(facetRequest.sortCriteria).to.eq(sorting);
              });
            });
          }
        );
      });

      describe('with invalid sorting', () => {
        beforeEach(() => {
          // This error occasionally occurs with the Salesforce Lightning Modal component, although we don't know exactly why it occurs, we do know that it only occurs in this Cypress test environment and never in the production environment.
          cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include(
              "Cannot read properties of null (reading 'appendChild')"
            );
            return false;
          });
          visitFacetPage(
            {
              sortCriteria: 'invalid',
              useCase: param.useCase,
            },
            false
          );
        });

        it('should render the component error', () => {
          Expect.displayLabel(false);
          Expect.displayComponentError(true);
        });
      });

      describe('with no search', () => {
        function setupNoSearch() {
          visitFacetPage({
            noSearch: true,
            useCase: param.useCase,
          });
        }

        it('should render correctly', () => {
          setupNoSearch();

          Expect.displaySearchInput(false);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
          Expect.numberOfSelectedCheckboxValues(0);
        });
      });

      describe('with is collapsed', () => {
        function setupIsCollapsed() {
          visitFacetPage({
            isCollapsed: true,
            useCase: param.useCase,
          });
        }

        it('should render correctly', () => {
          setupIsCollapsed();

          Expect.labelContains(defaultLabel);
          Expect.displayExpandButton(true);
          Expect.displaySearchInput(false);
          Expect.numberOfIdleCheckboxValues(0);
          Expect.displayShowMoreButton(false);
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('with a selected value in the URL', () => {
          const selectedValue = 'Account';

          function loadWithSelectedValue() {
            loadFromUrlHash(
              {
                field: defaultField,
              },
              `f-objecttype=${selectedValue}`
            );
          }

          it('should render correctly', () => {
            loadWithSelectedValue();

            Expect.numberOfSelectedCheckboxValues(1);
            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            Expect.selectedValuesContain(selectedValue);
          });
        });
      }
    });
  });

  describe.skip('with values testing accessibility', () => {
    beforeEach(() => {
      visitFacetPage(
        {
          field: defaultField,
          label: defaultLabel,
          numberOfValues: defaultNumberOfValues,
        },
        true
      );
    });

    it('should be accessible through keyboard', () => {
      Actions.selectFirstFacetValueWithKeyboardTab();
      Expect.clearFilterContains('Clear filter');
      Expect.numberOfSelectedCheckboxValues(1);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
    });
  });
});
