import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox-actions';
import * as BreadboxAssertions from '../../breadbox-assertions';
import {breadboxComponent} from '../../breadbox-selectors';
import * as CommonAssertions from '../../common-assertions';
import {
  pressClearButton,
  pressLabelButton,
  typeFacetSearchQuery,
  pressShowLess,
  pressShowMore,
  selectIdleCheckboxValueAt,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {addFacet} from '../facet/facet-actions';
import {FacetSelectors} from '../facet/facet-selectors';
import {
  selectChildValueAt,
  canadaHierarchyIndex,
  canadaHierarchy,
  defaultNumberOfValues,
  togoHierarchy,
  addCategoryFacet,
  hierarchicalField,
  selectSearchResultAt,
  categoryFacetLabel,
  pressParentButton,
  pressActiveParent,
  pressAllCategoriesButton,
} from './category-facet-actions';
import * as CategoryFacetAssertions from './category-facet-assertions';
import {
  CategoryFacetSelectors,
  categoryFacetComponent,
} from './category-facet-selectors';

describe.skip('Category Facet Test Suites', () => {
  describe('with default settings', () => {
    function setupWithDefaultSettings() {
      new TestFixture().with(addCategoryFacet()).init();
    }

    describe('verify rendering', () => {
      beforeEach(setupWithDefaultSettings);

      CommonAssertions.assertAccessibility(categoryFacetComponent);
      CommonAssertions.assertContainsComponentError(
        CategoryFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplayFacet(CategoryFacetSelectors, true);
      CommonFacetAssertions.assertDisplayPlaceholder(
        CategoryFacetSelectors,
        false
      );
      CategoryFacetAssertions.assertNumberOfChildValues(defaultNumberOfValues);
      CategoryFacetAssertions.assertNumberOfParentValues(0);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        CategoryFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        CategoryFacetSelectors,
        false
      );
      CategoryFacetAssertions.assertDisplaySearchInput(false);
      CategoryFacetAssertions.assertDisplayAllCategoriesButton(false);
      CommonFacetAssertions.assertDisplayClearButton(
        CategoryFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        CategoryFacetSelectors,
        categoryFacetLabel
      );
      CategoryFacetAssertions.assertValuesSortedByOccurrences();
      CategoryFacetAssertions.assertHierarchy({
        type: 'values',
        valueLabels: ['North America', 'Europe', 'Asia'],
      });
    });

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      function setupGoDeeperOneLevel() {
        setupWithDefaultSettings();
        selectChildValueAt(canadaHierarchyIndex[0]);
      }

      const selectedPath = canadaHierarchy.slice(0, 1);

      describe('verify rendering', () => {
        beforeEach(setupGoDeeperOneLevel);

        CommonAssertions.assertAccessibility(categoryFacetComponent);
        CategoryFacetAssertions.assertDisplayAllCategoriesButton(true);
        CommonFacetAssertions.assertDisplayClearButton(
          CategoryFacetSelectors,
          false
        );
        CategoryFacetAssertions.assertNumberOfChildValues(
          defaultNumberOfValues
        );
        CategoryFacetAssertions.assertNumberOfParentValues(1);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false
        );
        CategoryFacetAssertions.assertPathInUrl(selectedPath);

        describe('when collapsing the facet', () => {
          beforeEach(() => {
            CategoryFacetSelectors.labelButton().click();
          });

          CategoryFacetAssertions.assertNumberOfChildValues(0);
          CategoryFacetAssertions.assertNumberOfParentValues(0);
          CategoryFacetAssertions.assertDisplayAllCategoriesButton(false);
          CommonFacetAssertions.assertDisplayClearButton(
            CategoryFacetSelectors,
            true
          );
        });
      });

      describe('verify analytics', () => {
        beforeEach(setupGoDeeperOneLevel);
        CategoryFacetAssertions.assertLogFacetSelect(selectedPath);
      });

      describe('when selecting the "Show more" button', () => {
        beforeEach(() => {
          setupGoDeeperOneLevel();
          pressShowMore(CategoryFacetSelectors);
        });

        describe('verify rendering', () => {
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues * 2
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            true
          );
        });

        describe('verify analytics', () => {
          CategoryFacetAssertions.assertLogFacetShowMore();
        });

        describe('when selecting the "Show less" button', () => {
          beforeEach(() => {
            pressShowLess(CategoryFacetSelectors);
          });

          describe('verify rendering', () => {
            CategoryFacetAssertions.assertNumberOfChildValues(
              defaultNumberOfValues
            );
            CommonFacetAssertions.assertDisplayShowLessButton(
              CategoryFacetSelectors,
              false
            );
          });

          describe('verify analytics', () => {
            CategoryFacetAssertions.assertLogFacetShowLess();
          });
        });
      });

      describe('when selecting the "All Categories" button', () => {
        function setupClear() {
          setupGoDeeperOneLevel();
          pressAllCategoriesButton();
        }
        beforeEach(setupClear);
        describe('verify rendering', () => {
          CategoryFacetAssertions.assertDisplayAllCategoriesButton(false);
          CategoryFacetAssertions.assertNumberOfParentValues(0);
          CategoryFacetAssertions.assertNoPathInUrl();
        });

        describe('verify analytics', () => {
          CategoryFacetAssertions.assertLogClearFacetValues();
        });
      });

      describe('when clicking the active value', () => {
        function setupClear() {
          setupGoDeeperOneLevel();
          pressActiveParent();
        }
        beforeEach(setupClear);
        describe('verify rendering', () => {
          CategoryFacetAssertions.assertDisplayAllCategoriesButton(false);
          CategoryFacetAssertions.assertNumberOfParentValues(0);
          CategoryFacetAssertions.assertNoPathInUrl();
        });

        describe('verify analytics', () => {
          CategoryFacetAssertions.assertLogClearFacetValues();
        });
      });
    });

    describe('when selecting values subsequently to go deepeer three level', () => {
      beforeEach(() => {
        setupWithDefaultSettings();
        selectChildValueAt(canadaHierarchyIndex[0]);
        selectChildValueAt(canadaHierarchyIndex[1]);
        selectChildValueAt(canadaHierarchyIndex[2]);
        pressShowMore(CategoryFacetSelectors);
      });

      CategoryFacetAssertions.assertHierarchy({
        type: 'hierarchy-root',
        children: {
          type: 'sub-parent',
          valueLabel: canadaHierarchy[0],
          children: {
            type: 'sub-parent',
            valueLabel: canadaHierarchy[1],
            children: {
              type: 'active-value',
              valueLabel: canadaHierarchy[2],
              children: {
                type: 'values',
                valueLabels: ['Montreal', 'Quebec', 'Sherbrooke'],
              },
            },
          },
        },
      });
    });

    describe('when selecting values subsequently to go deeper four level (last level of the dataset)', () => {
      function setupGoDeeperLastLevel() {
        setupWithDefaultSettings();
        selectChildValueAt(canadaHierarchyIndex[0]);
        selectChildValueAt(canadaHierarchyIndex[1]);
        selectChildValueAt(canadaHierarchyIndex[2]);
        selectChildValueAt(canadaHierarchyIndex[3]);
      }
      beforeEach(setupGoDeeperLastLevel);
      describe('verify rendering', () => {
        CategoryFacetAssertions.assertDisplayAllCategoriesButton(true);
        CategoryFacetAssertions.assertNumberOfParentValues(4);
        CategoryFacetAssertions.assertNumberOfChildValues(0);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CategoryFacetAssertions.assertPathInUrl(canadaHierarchy);
      });

      describe('verify analytics', () => {
        CategoryFacetAssertions.assertLogFacetSelect(canadaHierarchy);
      });

      describe('when selecting the first parent button', () => {
        const selectedPath = canadaHierarchy.slice(0, 1);
        function setupSelectFirstParent() {
          pressParentButton(0);
        }
        beforeEach(setupSelectFirstParent);

        describe('verify rendering', () => {
          CategoryFacetAssertions.assertDisplayAllCategoriesButton(true);
          CategoryFacetAssertions.assertNumberOfParentValues(1);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues
          );
          CommonFacetAssertions.assertDisplayShowMoreButton(
            CategoryFacetSelectors,
            true
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertPathInUrl(selectedPath);
        });

        describe('verify analytics', () => {
          CategoryFacetAssertions.assertLogFacetSelect(selectedPath);
        });

        describe('when selecting the label button to collapse', () => {
          function setupSelectLabelCollapse() {
            pressLabelButton(CategoryFacetSelectors, true);
          }
          beforeEach(setupSelectLabelCollapse);
          describe('verify rendering', () => {
            CommonFacetAssertions.assertDisplayFacet(
              CategoryFacetSelectors,
              true
            );
            CommonAssertions.assertAccessibility(categoryFacetComponent);
            CommonAssertions.assertContainsComponentError(
              CategoryFacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayClearButton(
              CategoryFacetSelectors,
              true
            );
            CommonFacetAssertions.assertDisplayValues(
              CategoryFacetSelectors,
              false
            );
            CommonFacetAssertions.assertLabelContains(
              CategoryFacetSelectors,
              categoryFacetLabel
            );
          });

          describe('when selecting the label button to expand', () => {
            function setupSelectLabelExpand() {
              CategoryFacetSelectors.labelButton().click();
            }

            beforeEach(setupSelectLabelExpand);

            CommonFacetAssertions.assertDisplayClearButton(
              CategoryFacetSelectors,
              false
            );
            CommonFacetAssertions.assertDisplayValues(
              CategoryFacetSelectors,
              true
            );
            CommonFacetAssertions.assertDisplayShowMoreButton(
              CategoryFacetSelectors,
              true
            );
          });

          describe('when selecting the "Clear" button', () => {
            function setupClearBoxValues() {
              pressClearButton(CategoryFacetSelectors);
            }
            beforeEach(setupClearBoxValues);
            describe('verify rendering', () => {
              CommonFacetAssertions.assertDisplayClearButton(
                CategoryFacetSelectors,
                false
              );
            });

            describe('verify analytics', () => {
              CategoryFacetAssertions.assertLogClearFacetValues();
            });
          });
        });
      });
    });

    describe('when selecting the "Show more" button', () => {
      const numberOfValues = 3;
      function setupShowMore() {
        new TestFixture()
          .with(
            addCategoryFacet({
              'number-of-values': numberOfValues,
            })
          )
          .init();
        pressShowMore(CategoryFacetSelectors);
      }

      describe('verify rendering', () => {
        beforeEach(setupShowMore);
        CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues * 2);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          true
        );
      });

      describe('verify analytics', () => {
        beforeEach(setupShowMore);
        CategoryFacetAssertions.assertLogFacetShowMore();
      });

      describe('when there\'s no more "Show more" button', () => {
        function setupRepeatShowMore() {
          new TestFixture()
            .with(
              addCategoryFacet({
                'number-of-values': numberOfValues,
              })
            )
            .init();
          pressShowMore(CategoryFacetSelectors);
          CategoryFacetSelectors.childValue()
            .its('length')
            .should('eq', numberOfValues * 2);
          pressShowMore(CategoryFacetSelectors);
        }

        describe('verify rendering', () => {
          beforeEach(setupRepeatShowMore);

          CommonFacetAssertions.assertDisplayShowMoreButton(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            true
          );
        });
      });

      describe('when selecting the "Show less" button', () => {
        function setupShowLess() {
          setupShowMore();
          pressShowLess(CategoryFacetSelectors);
        }
        beforeEach(setupShowLess);
        describe('verify rendering', () => {
          CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);
          CommonFacetAssertions.assertDisplayShowMoreButton(
            CategoryFacetSelectors,
            true
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            false
          );
        });

        describe('verify analytics', () => {
          CategoryFacetAssertions.assertLogFacetShowLess();
        });
      });
    });
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addCategoryFacet({'number-of-values': numberOfValues}))
        .init();
    }

    beforeEach(setupCustomNumberOfValues);

    CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      beforeEach(() => {
        selectChildValueAt(0);
      });

      CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);
    });
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addCategoryFacet({'sort-criteria': 'alphanumeric'}))
        .init();
    });
    CategoryFacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addCategoryFacet({}, true))
        .withHash('cf-geographicalhierarchy=Africa,Togo')
        .init();
    });

    CategoryFacetAssertions.assertDisplayAllCategoriesButton(true);
    CategoryFacetAssertions.assertNumberOfParentValues(2);
    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
  });

  describe('with #basePath & #filterByBasePath set to true (default)', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addCategoryFacet(
            {'base-path': JSON.stringify(togoHierarchy.slice(0, 2))},
            true
          )
        )
        .init();
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
    CategoryFacetAssertions.assertDisplayAllCategoriesButton(false);
    CategoryFacetAssertions.assertNumberOfParentValues(0);
  });

  describe('with #basePath using incorrect JSON array', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addCategoryFacet(
            {
              'base-path': 'not a JSON array',
            },
            true
          )
        )
        .init();
    });
    CommonAssertions.assertConsoleErrorMessage(
      'Error while parsing attribute base-path'
    );
  });

  describe('with #basePath & #filterByBasePath set to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addCategoryFacet(
            {
              'base-path': JSON.stringify(togoHierarchy.slice(0, 2)),
              'filter-by-base-path': 'false',
            },
            true
          )
        )
        .init();
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(
      defaultNumberOfValues * 2
    );
  });

  describe('when no search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addCategoryFacet())
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayPlaceholder(
      CategoryFacetSelectors,
      true
    );
  });

  describe('with an invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addCategoryFacet({'sort-criteria': 'notasortcriteria'}))
        .init();
    });

    CommonAssertions.assertContainsComponentError(CategoryFacetSelectors, true);
  });

  describe('when field returns no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addCategoryFacet({field: 'notanactualfield'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(CategoryFacetSelectors, false);
  });

  describe('with "with-search" set to "true"', () => {
    function setupWithFacetSearch() {
      new TestFixture().with(addCategoryFacet({'with-search': 'true'})).init();
    }

    describe('verify rendering', () => {
      beforeEach(() => {
        setupWithFacetSearch();
      });

      CategoryFacetAssertions.assertDisplaySearchInput(true);
    });

    describe('when searching for a value that returns many results', () => {
      const query = 'mal';
      function setupSearchFor() {
        setupWithFacetSearch();
        typeFacetSearchQuery(CategoryFacetSelectors, query, true);
      }

      describe('verify rendering', () => {
        beforeEach(setupSearchFor);

        CommonAssertions.assertAccessibility(categoryFacetComponent);
        CategoryFacetAssertions.assertNumberOfFacetSearchResults(
          defaultNumberOfValues
        );
        CommonFacetAssertions.assertDisplayMoreMatchesFound(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayNoMatchesFound(
          CategoryFacetSelectors,
          false
        );
        CommonFacetAssertions.assertMoreMatchesFoundContainsQuery(
          CategoryFacetSelectors,
          query
        );
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplaySearchClearButton(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertHighlightsResults(
          CategoryFacetSelectors,
          query
        );
      });

      describe('when selecting a search result', () => {
        function setupSelectSearchResult() {
          setupSearchFor();
          selectSearchResultAt(2);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectSearchResult);

          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
          CommonFacetAssertions.assertDisplaySearchClearButton(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertDisplayAllCategoriesButton(true);
          CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
          CategoryFacetAssertions.assertNumberOfChildValues(1);
          CategoryFacetAssertions.assertNumberOfParentValues(2);
          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
        });
      });

      describe('when clearing the facet search results', () => {
        function setupClearFacetSearchResults() {
          setupSearchFor();
          CategoryFacetSelectors.searchClearButton().click();
        }

        describe('verify rendering', () => {
          beforeEach(setupClearFacetSearchResults);

          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
          CommonFacetAssertions.assertDisplaySearchClearButton(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
        });
      });
    });

    describe('when searching for a value that returns no results', () => {
      const query = 'nonono';
      function setupSearchForNoValues() {
        setupWithFacetSearch();
        typeFacetSearchQuery(CategoryFacetSelectors, query, false);
      }

      describe('verify rendering', () => {
        beforeEach(setupSearchForNoValues);

        CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
        CommonFacetAssertions.assertDisplayMoreMatchesFound(
          CategoryFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayNoMatchesFound(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertNoMatchesFoundContainsQuery(
          CategoryFacetSelectors,
          query
        );
        CommonFacetAssertions.assertDisplaySearchClearButton(
          CategoryFacetSelectors,
          true
        );
      });
    });
  });

  describe('with breadbox', () => {
    function setupBreadboxWithCategoryFacet() {
      new TestFixture().with(addBreadbox()).with(addCategoryFacet()).init();
    }
    describe('verify rendering', () => {
      beforeEach(setupBreadboxWithCategoryFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      function setupSelectedCategoryFacet() {
        setupBreadboxWithCategoryFacet();
        selectChildValueAt(canadaHierarchyIndex[0]);
      }

      describe('verify rendering', () => {
        beforeEach(() => {
          setupSelectedCategoryFacet();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        const selectedPath = canadaHierarchy.slice(0, 1);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertCategoryPathInBreadcrumb(selectedPath);
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when clicking the active value', () => {
        beforeEach(() => {
          setupSelectedCategoryFacet();
          pressActiveParent();
        });

        describe('verify rendering', () => {
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });
      });

      describe('when deselecting a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupDeselectCategoryFacetValue() {
          setupSelectedCategoryFacet();
          deselectBreadcrumbAtIndex(deselectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(() => {
            setupDeselectCategoryFacetValue();
            cy.wait(TestFixture.interceptAliases.Search);
          });
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytics', () => {
          beforeEach(setupDeselectCategoryFacetValue);
          BreadboxAssertions.assertLogBreadcrumbCategoryFacet(
            hierarchicalField
          );
        });

        describe('verify selected facetValue', () => {
          beforeEach(setupDeselectCategoryFacetValue);
          CategoryFacetAssertions.assertNumberOfParentValues(0);
        });
      });
    });

    describe('when selecting values subsequently to go deeper three level (last level of the dataset)', () => {
      function setupSelectedDeeperLeverCategoryFacets() {
        setupBreadboxWithCategoryFacet();
        selectChildValueAt(canadaHierarchyIndex[0]);
        selectChildValueAt(canadaHierarchyIndex[1]);
        selectChildValueAt(canadaHierarchyIndex[2]);
        selectChildValueAt(canadaHierarchyIndex[3]);
      }

      describe('verify rendering', () => {
        const selectedPath = canadaHierarchy;
        beforeEach(() => {
          setupSelectedDeeperLeverCategoryFacets();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertCategoryPathInBreadcrumb(selectedPath);
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(false);
        BreadboxAssertions.assertBreadcrumbDisplayLength(1);
      });

      describe('when selecting the "All Categories" button', () => {
        beforeEach(() => {
          setupSelectedDeeperLeverCategoryFacets();
          pressAllCategoriesButton();
          cy.wait(TestFixture.interceptAliases.Search);
        });

        describe('verify rendering', () => {
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });
      });
    });
  });

  describe('with depends-on', () => {
    const facetId = 'abc';
    describe('as a dependent', () => {
      const parentFacetId = 'def';
      const parentField = 'filetype';
      const expectedValue = 'txt';
      beforeEach(() => {
        new TestFixture()
          .with(
            addCategoryFacet({
              'facet-id': facetId,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      it('should control display of both parent and child properly', () => {
        CategoryFacetSelectors.withId(facetId).wrapper().should('not.exist');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          FacetSelectors.withId(parentFacetId),
          expectedValue,
          true
        );
        selectIdleCheckboxValueAt(FacetSelectors.withId(parentFacetId), 0);
        CategoryFacetSelectors.withId(facetId).wrapper().should('be.visible');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });
    });

    describe('as a parent', () => {
      const dependentFacetId = 'def';
      const dependentField = 'filetype';
      const expectedValue = 'Fiji';
      beforeEach(() => {
        new TestFixture()
          .with(addCategoryFacet({'facet-id': facetId, 'with-search': 'true'}))
          .with(
            addFacet({
              'facet-id': dependentFacetId,
              field: dependentField,
              [`depends-on-${facetId}`]: expectedValue,
            })
          )
          .init();
      });

      it('should control display of both parent and child properly', () => {
        FacetSelectors.withId(dependentFacetId).wrapper().should('not.exist');
        CategoryFacetSelectors.withId(facetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          CategoryFacetSelectors.withId(facetId),
          expectedValue,
          true
        );
        selectSearchResultAt(0);
        FacetSelectors.withId(dependentFacetId).wrapper().should('be.visible');
        CategoryFacetSelectors.withId(facetId).wrapper().should('be.visible');
      });
    });

    describe('with two dependencies', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addCategoryFacet({
              'facet-id': 'ghi',
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        CategoryFacetSelectors.withId('ghi'),
        true
      );
    });
  });
});
