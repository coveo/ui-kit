import {configure} from '../../../page-objects/configurator';

import {FacetExpectations as Expect} from './facet-expectations';
import {
  extractFacetValues,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
  interceptSearchWithError,
  mockNoMoreFacetValues,
} from '../../../page-objects/search';
import {FacetActions as Actions} from './facet-actions';
import {scope} from '../../../reporters/detailed-collector';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
  isCollapsed: boolean;
  displayValuesAs: string;
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
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
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

  function aliasFacetValues() {
    cy.wait(InterceptAliases.Search).then((interception) => {
      const indexValues = extractFacetValues(interception.response);
      cy.wrap(indexValues).as(indexFacetValuesAlias.substring(1));
    });
  }

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
          });
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
        },
        false
      );
    }

    function setupWithNoMoreValues() {
      mockNoMoreFacetValues(defaultField);
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    function searchForValue(query: string) {
      setupWithValues();
      Actions.typeQueryInSearchInput(query);
    }

    function searchForSingleValue() {
      const singleValueQuery = 'account';
      Actions.typeQueryInSearchInput(singleValueQuery);
      for (let i = 0; i < singleValueQuery.length; i++) {
        cy.wait(InterceptAliases.FacetSearch);
      }
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

        aliasFacetValues();
        Expect.facetValuesEqual(indexFacetValuesAlias);
      });

      scope('when selecting a value', () => {
        function selectFirstFacetValue() {
          Actions.checkFirstValue();
        }

        function collapseFacet() {
          Actions.clickCollapseButton();
          cy.wait(InterceptAliases.Search);
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
            cy.wait(InterceptAliases.Search);
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
          Expect.numberOfSelectedCheckboxValues(initialNumberOfSelectedValues);
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
        Expect.logFacetSearch(defaultField);
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

      scope('when searching for a value that returns a single result', () => {
        searchForSingleValue();

        Expect.numberOfIdleCheckboxValues(1);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.displayMoreMatchesFound(false);
        Expect.displayNoMatchesFound(false);
        Expect.displaySearchClearButton(true);
      });

      scope('when searching for a value that returns no results', () => {
        const query = 'this facet value does not exist';

        function searchForInvalidValue() {
          Actions.clickSearchClearButton();
          Actions.typeQueryInSearchInput(query);
        }
        searchForInvalidValue();

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
          searchForSingleValue();
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
    });

    it('should show more/less values', () => {
      scope('when clicking show more values', () => {
        const smallNumberOfValues = 2;

        function showMoreValues() {
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: smallNumberOfValues,
          });
          Actions.clickShowMoreButton();
        }
        showMoreValues();
        Expect.numberOfValues(smallNumberOfValues * 2);
        aliasFacetValues();
        Expect.facetValuesEqual(indexFacetValuesAlias);

        scope('when clicking show more button again', () => {
          function showMoreValuesAgain() {
            Actions.clickShowMoreButton();
          }

          showMoreValuesAgain();
          Expect.numberOfValues(smallNumberOfValues * 3);
          aliasFacetValues();
          Expect.facetValuesEqual(indexFacetValuesAlias);

          scope('when clicking show less button', () => {
            function showLessValues() {
              Actions.clickShowLessButton();
            }

            showLessValues();
            Expect.numberOfValues(smallNumberOfValues);
            aliasFacetValues();
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
    function setupWithLinkValues() {
      visitFacetPage(
        {
          field: defaultField,
          label: defaultLabel,
          displayValuesAs: 'link',
        },
        false
      );
    }

    function setupWithNoMoreValues() {
      mockNoMoreFacetValues(defaultField);
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        displayValuesAs: 'link',
      });
      cy.wait(InterceptAliases.Search);
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

        aliasFacetValues();
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
            cy.wait(InterceptAliases.Search);
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

      scope('when searching for a value that returns results', () => {
        const query = 'a';
        setupWithLinkValues();

        function searchForValue() {
          Actions.typeQueryInSearchInput(query);
        }

        function searchForSingleValue() {
          const singleValueQuery = 'account';
          Actions.typeQueryInSearchInput(singleValueQuery);
          for (let i = 0; i < singleValueQuery.length; i++) {
            cy.wait(InterceptAliases.FacetSearch);
          }
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
        Expect.logFacetSearch(defaultField);

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

        scope('when searching for a value that returns a single result', () => {
          searchForSingleValue();

          Expect.numberOfIdleLinkValues(1);
          Expect.numberOfSelectedLinkValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(false);
          Expect.displaySearchClearButton(true);
        });

        scope('when searching for a value that returns no results', () => {
          const query = 'this facet value does not exist';

          function searchForInvalidValue() {
            Actions.clickSearchClearButton();
            Actions.typeQueryInSearchInput(query);
          }

          searchForInvalidValue();

          Expect.numberOfIdleLinkValues(0);
          Expect.numberOfSelectedLinkValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(true);
          Expect.noMatchesFoundContainsQuery(query);
          Expect.displaySearchClearButton(true);
        });
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
    });

    it('should show more/less values', () => {
      scope('when clicking show more values', () => {
        const smallNumberOfValues = 2;

        function showMoreValues() {
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: smallNumberOfValues,
          });
          Actions.clickShowMoreButton();
        }

        showMoreValues();
        Expect.numberOfValues(smallNumberOfValues * 2);
        aliasFacetValues();
        Expect.facetValuesEqual(indexFacetValuesAlias);

        scope('when clicking show more button again', () => {
          function showMoreValuesAgain() {
            Actions.clickShowMoreButton();
          }

          showMoreValuesAgain();
          Expect.numberOfValues(smallNumberOfValues * 3);
          aliasFacetValues();
          Expect.facetValuesEqual(indexFacetValuesAlias);

          scope('when clicking show less button', () => {
            function showLessValues() {
              showMoreValuesAgain();
              cy.wait(InterceptAliases.Search);
              Actions.clickShowLessButton();
            }

            showLessValues();
            Expect.numberOfValues(smallNumberOfValues);
            aliasFacetValues();
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
      visitFacetPage({
        field: 'language',
        label: 'Language',
        numberOfValues: 3,
      });
    }

    it('should render correctly', () => {
      setupCustomOptions();

      Expect.labelContains('Language');
      Expect.facetValueContains('English');
      Expect.numberOfIdleCheckboxValues(3);
    });
  });

  describe('when field returns no results', () => {
    before(() => {
      visitFacetPage({
        field: 'somethingthatdoesnotexist',
      });
    });

    it('should render correctly', () => {
      Expect.displayLabel(false);
    });
  });

  describe('with custom sorting', () => {
    ['automatic', 'score', 'alphanumeric', 'occurrences'].forEach((sorting) => {
      it(`should use "${sorting}" sorting in the facet request`, () => {
        visitFacetPage(
          {
            sortCriteria: sorting,
          },
          false
        );
        cy.wait(InterceptAliases.Search).then((interception) => {
          const facetRequest = interception.request.body.facets[0];
          expect(facetRequest.sortCriteria).to.eq(sorting);
        });
      });
    });
  });

  describe('with invalid sorting', () => {
    before(() => {
      visitFacetPage(
        {
          sortCriteria: 'invalid',
        },
        false
      );
    });
    it('should render correctly', () => {
      Expect.displayLabel(false);
    });
  });

  describe('with no search', () => {
    function setupNoSearch() {
      visitFacetPage({
        noSearch: true,
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

  describe('with a selected value in the URL', () => {
    const selectedValue = 'Account';

    function loadWithSelectedValue() {
      loadFromUrlHash(
        {
          field: defaultField,
        },
        `f[objecttype]=${selectedValue}`
      );
    }

    it('should render correctly', () => {
      loadWithSelectedValue();

      Expect.numberOfSelectedCheckboxValues(1);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
      Expect.selectedValuesContain(selectedValue);
    });
  });
});
