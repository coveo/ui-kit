import {SearchInterface, TestFixture} from '../../../fixtures/test-fixture';
import {facetComponent, FacetSelectors} from './facet-selectors';
import {
  addFacet,
  field,
  label,
  defaultNumberOfValues,
  selectIdleBoxValueAt,
} from './facet-actions';
import {
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
  typeFacetSearchQuery,
} from '../facet-common-actions';
import * as FacetAssertions from './facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';

describe('Facet v1 Test Suites', () => {
  describe('with checkbox values', () => {
    function setupWithCheckboxValues() {
      new TestFixture().with(addFacet({field, label})).init();
    }

    describe('verify rendering', () => {
      before(setupWithCheckboxValues);

      CommonAssertions.assertAccessibility(facetComponent);
      CommonAssertions.assertContainsComponentError(FacetSelectors, false);
      CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
      CommonFacetAssertions.assertLabelContains(FacetSelectors, label);
      CommonFacetAssertions.assertDisplayValues(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, false);
      CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
        FacetSelectors,
        0
      );
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues
      );
      CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, false);
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, false);
      CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectCheckboxValue() {
        setupWithCheckboxValues();
        selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectCheckboxValue);

        CommonAssertions.assertAccessibility(facetComponent);
        CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          FacetSelectors,
          1
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          FacetSelectors,
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectCheckboxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondCheckboxValue() {
          setupSelectCheckboxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleCheckboxValueAt(FacetSelectors, secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondCheckboxValue);

          CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            FacetSelectors,
            2
          );
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            FacetSelectors,
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondCheckboxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            setupSelectSecondCheckboxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearCheckboxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
              FacetSelectors,
              0
            );
            CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues
            );
          });
          describe('verify analytics', () => {
            before(setupClearCheckboxValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'bbc';
        function setupSearchFor() {
          setupSelectCheckboxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          typeFacetSearchQuery(FacetSelectors, query);
        }

        describe('verify rendering', () => {
          before(setupSearchFor);

          CommonAssertions.assertAccessibility(facetComponent);
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            FacetSelectors,
            defaultNumberOfValues
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            FacetSelectors,
            0
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            FacetSelectors,
            true
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            FacetSelectors,
            false
          );
          CommonFacetAssertions.assertMoreMatchesFoundContainsQuery(
            FacetSelectors,
            query
          );
          CommonFacetAssertions.assertDisplayShowMoreButton(
            FacetSelectors,
            false,
            false
          );
          CommonFacetAssertions.assertDisplaySearchClearButton(
            FacetSelectors,
            true
          );
          CommonFacetAssertions.assertHighlightsResults(FacetSelectors, query);
        });

        describe('verify analytics', () => {
          before(setupSearchFor);

          CommonFacetAssertions.assertLogFacetSearch(field);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            cy.wait(TestFixture.interceptAliases.UA);
            selectIdleCheckboxValueAt(FacetSelectors, 5);
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupSelectSearchResult);

            CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues - 2
            );
            CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
              FacetSelectors,
              2
            );
            CommonFacetAssertions.assertDisplayMoreMatchesFound(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayNoMatchesFound(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayShowMoreButton(
              FacetSelectors,
              true,
              false
            );
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
            CommonFacetAssertions.assertDisplaySearchClearButton(
              FacetSelectors,
              false
            );
          });

          describe('verify analytics', () => {
            before(setupSelectSearchResult);
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });

        describe('when clearing the facet search results', () => {
          function setupClearFacetSearchResults() {
            setupSearchFor();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.searchClearButton().click();
          }

          describe('verify rendering', () => {
            before(setupClearFacetSearchResults);

            CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues - 1
            );
            CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
              FacetSelectors,
              1
            );
            CommonFacetAssertions.assertDisplayMoreMatchesFound(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayNoMatchesFound(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayShowMoreButton(
              FacetSelectors,
              true
            );
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
            CommonFacetAssertions.assertDisplaySearchClearButton(
              FacetSelectors,
              false
            );
          });
        });
      });

      describe('when searching for a value that returns a single result', () => {
        const query = 'amoreau';
        function setupSearchForSingleValue() {
          setupSelectCheckboxValue();
          typeFacetSearchQuery(FacetSelectors, query);
        }

        describe('verify rendering', () => {
          before(setupSearchForSingleValue);

          CommonAssertions.assertAccessibility(facetComponent);
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            FacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            FacetSelectors,
            0
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            FacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            FacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplaySearchClearButton(
            FacetSelectors,
            true
          );
        });
      });

      describe('when searching for a value that returns no results', () => {
        const query = 'nonono';
        function setupSearchForNoValues() {
          setupSelectCheckboxValue();
          typeFacetSearchQuery(FacetSelectors, query);
        }

        describe('verify rendering', () => {
          before(setupSearchForNoValues);

          CommonAssertions.assertAccessibility(facetComponent);
          CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
            FacetSelectors,
            0
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            FacetSelectors,
            0
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            FacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            FacetSelectors,
            true
          );
          CommonFacetAssertions.assertNoMatchesFoundContainsQuery(
            FacetSelectors,
            query
          );
          CommonFacetAssertions.assertDisplaySearchClearButton(
            FacetSelectors,
            true
          );
        });
      });
    });
  });

  describe('with link values', () => {
    function setupWithLinkValues() {
      new TestFixture()
        .with(addFacet({field, label, 'display-values-as': 'link'}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupWithLinkValues);

      CommonAssertions.assertAccessibility(facetComponent);
      CommonFacetAssertions.assertDisplayValues(FacetSelectors, true);
      CommonFacetAssertions.assertNumberOfSelectedLinkValues(FacetSelectors, 0);
      CommonFacetAssertions.assertNumberOfIdleLinkValues(
        FacetSelectors,
        defaultNumberOfValues
      );
      CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, false);
      CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectLinkValue() {
        setupWithLinkValues();
        selectIdleLinkValueAt(FacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectLinkValue);

        CommonAssertions.assertAccessibility(facetComponent);
        CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          FacetSelectors,
          1
        );
        CommonFacetAssertions.assertNumberOfIdleLinkValues(
          FacetSelectors,
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        before(setupSelectLinkValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondLinkValue() {
          setupSelectLinkValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleLinkValueAt(FacetSelectors, secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondLinkValue);

          CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            FacetSelectors,
            1
          );
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            FacetSelectors,
            defaultNumberOfValues - 1
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondLinkValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearLinkValues() {
            setupSelectSecondLinkValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearLinkValues);

            CommonFacetAssertions.assertDisplayClearButton(
              FacetSelectors,
              false
            );
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              FacetSelectors,
              0
            );
            CommonFacetAssertions.assertNumberOfIdleLinkValues(
              FacetSelectors,
              defaultNumberOfValues
            );
          });
          describe('verify analytics', () => {
            before(setupClearLinkValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'bbc';
        function setupSearchFor() {
          setupSelectLinkValue();
          cy.wait(TestFixture.interceptAliases.UA);
          typeFacetSearchQuery(FacetSelectors, query);
        }

        describe('verify rendering', () => {
          before(setupSearchFor);

          CommonAssertions.assertAccessibility(facetComponent);
          CommonFacetAssertions.assertNumberOfIdleLinkValues(
            FacetSelectors,
            defaultNumberOfValues
          );
          CommonFacetAssertions.assertNumberOfSelectedLinkValues(
            FacetSelectors,
            0
          );
          CommonFacetAssertions.assertHighlightsResults(FacetSelectors, query);
        });

        describe('verify analytics', () => {
          before(setupSearchFor);

          CommonFacetAssertions.assertLogFacetSearch(field);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            cy.wait(TestFixture.interceptAliases.UA);
            selectIdleLinkValueAt(FacetSelectors, 5);
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupSelectSearchResult);

            CommonFacetAssertions.assertNumberOfIdleLinkValues(
              FacetSelectors,
              defaultNumberOfValues - 1
            );
            CommonFacetAssertions.assertNumberOfSelectedLinkValues(
              FacetSelectors,
              1
            );
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
          });

          describe('verify analytics', () => {
            before(setupSelectSearchResult);
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });
      });
    });
  });

  describe('with box values', () => {
    function setupWithBoxValues() {
      new TestFixture()
        .with(addFacet({field, label, 'display-values-as': 'box'}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupWithBoxValues);

      CommonAssertions.assertAccessibility(facetComponent);
      CommonFacetAssertions.assertDisplayValues(FacetSelectors, true);
      FacetAssertions.assertNumberOfSelectedBoxValues(0);
      FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
      CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, false);
      CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, true);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectBoxValue() {
        setupWithBoxValues();
        selectIdleBoxValueAt(selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectBoxValue);

        CommonAssertions.assertAccessibility(facetComponent);
        CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
        FacetAssertions.assertNumberOfSelectedBoxValues(1);
        FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        before(setupSelectBoxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          setupSelectBoxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          selectIdleBoxValueAt(secondSelectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSecondBoxValue);

          CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
          FacetAssertions.assertNumberOfSelectedBoxValues(2);
          FacetAssertions.assertNumberOfIdleBoxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          before(setupSelectSecondBoxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            setupSelectSecondBoxValue();
            cy.wait(TestFixture.interceptAliases.UA);
            FacetSelectors.clearButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              FacetSelectors,
              false
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(0);
            FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          });

          describe('verify analytics', () => {
            before(setupClearBoxValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'bbc';
        function setupSearchFor() {
          setupSelectBoxValue();
          cy.wait(TestFixture.interceptAliases.UA);
          typeFacetSearchQuery(FacetSelectors, query);
        }

        describe('verify rendering', () => {
          before(setupSearchFor);

          CommonAssertions.assertAccessibility(facetComponent);
          FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          FacetAssertions.assertNumberOfSelectedBoxValues(0);
          CommonFacetAssertions.assertHighlightsResults(FacetSelectors, query);
        });

        describe('verify analytics', () => {
          before(setupSearchFor);

          CommonFacetAssertions.assertLogFacetSearch(field);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            cy.wait(TestFixture.interceptAliases.UA);
            selectIdleBoxValueAt(5);
            cy.wait(TestFixture.interceptAliases.Search);
          }

          describe('verify rendering', () => {
            before(setupSelectSearchResult);

            FacetAssertions.assertNumberOfIdleBoxValues(
              defaultNumberOfValues - 2
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(2);
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
          });

          describe('verify analytics', () => {
            before(setupSelectSearchResult);
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });
      });
    });
  });

  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore() {
      new TestFixture().with(addFacet({field, label})).init();
      FacetSelectors.showMoreButton().click();
      cy.wait(TestFixture.interceptAliases.Search);
    }

    describe('verify rendering', () => {
      before(setupSelectShowMore);

      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      FacetAssertions.assertValuesSortedAlphanumerically();
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues * 2
      );
    });

    describe('verify analytics', () => {
      before(setupSelectShowMore);

      FacetAssertions.assertLogFacetShowMore(field);
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        cy.wait(TestFixture.interceptAliases.UA);
        FacetSelectors.showLessButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupSelectShowLess);

        CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
        CommonFacetAssertions.assertDisplayShowLessButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
          FacetSelectors,
          defaultNumberOfValues
        );
      });

      describe('verify analytics', () => {
        before(setupSelectShowLess);

        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture().with(addFacet({field, label})).init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      cy.wait(TestFixture.interceptAliases.Search);
      FacetSelectors.labelButton().click();
    }

    before(setupSelectLabelCollapse);

    CommonAssertions.assertAccessibility(facetComponent);
    CommonAssertions.assertContainsComponentError(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayValues(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayShowMoreButton(
      FacetSelectors,
      false,
      false
    );
    CommonFacetAssertions.assertDisplayShowLessButton(
      FacetSelectors,
      false,
      false
    );
    CommonFacetAssertions.assertLabelContains(FacetSelectors, label);

    describe('when selecting the label button to expand', () => {
      function setupSelectLabelExpand() {
        setupSelectLabelCollapse();
        FacetSelectors.labelButton().click();
      }

      before(setupSelectLabelExpand);

      CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayValues(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    });
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addFacet({field, label, 'number-of-values': numberOfValues}))
        .init();
    }

    before(setupCustomNumberOfValues);

    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      numberOfValues
    );
    CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, false);

    describe('when selecting the "Show More" button', () => {
      before(() => {
        setupCustomNumberOfValues();
        FacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.UA);
      });

      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        numberOfValues * 2
      );
      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
    });
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'alphanumeric'}))
        .init();
    });

    FacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with custom #sortCriteria, occurrences', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurences();
  });

  describe('when defining a value caption', () => {
    const caption = 'nicecaption';
    before(() => {
      const fixture = new TestFixture().with(addFacet({field, label})).init();
      cy.get(`@${fixture.elementAliases.SearchInterface}`).then(($si) => {
        const searchInterfaceComponent = $si.get()[0] as SearchInterface;

        searchInterfaceComponent.i18n.addResource(
          'en',
          `caption-${field}`,
          'BBC News',
          caption
        );
      });

      typeFacetSearchQuery(FacetSelectors, caption);
    });

    CommonFacetAssertions.assertFirstValueContains(FacetSelectors, caption);
  });

  describe('with #withSearch to false', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'with-search': 'false'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, true);
  });

  describe('with an invalid option', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'nononono'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, true);
  });

  describe('when field returns no results', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field: 'notanactualfield', label}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, false);
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withHash(`f[${field}]=Cervantes`)
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      FacetSelectors,
      1
    );
    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      defaultNumberOfValues - 1
    );
    CommonFacetAssertions.assertFirstValueContains(FacetSelectors, 'Cervantes');
  });
});
