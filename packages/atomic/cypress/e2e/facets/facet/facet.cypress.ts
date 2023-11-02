import {SearchInterface, TestFixture} from '../../../fixtures/test-fixture';
import {AnalyticsTracker} from '../../../utils/analyticsUtils';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox-actions';
import * as BreadboxAssertions from '../../breadbox-assertions';
import {breadboxComponent, BreadboxSelectors} from '../../breadbox-selectors';
import * as CommonAssertions from '../../common-assertions';
import {
  pressClearButton,
  pressLabelButton,
  pressShowLess,
  pressShowMore,
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
  typeFacetSearchQuery,
  pressClearSearchButton,
  excludeIdleCheckboxValueAt,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {
  addFacet,
  field,
  label,
  defaultNumberOfValues,
  selectIdleBoxValueAt,
} from './facet-actions';
import * as FacetAssertions from './facet-assertions';
import {facetComponent, FacetSelectors} from './facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with checkbox values', () => {
    function setupWithCheckboxValues() {
      new TestFixture().with(addFacet({field, label})).init();
    }

    describe('verify rendering', () => {
      beforeEach(setupWithCheckboxValues);

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
      CommonFacetAssertions.assertDisplayTwoStateCheckbox(FacetSelectors);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectCheckboxValue() {
        setupWithCheckboxValues();
        selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectCheckboxValue);

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
        beforeEach(setupSelectCheckboxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondCheckboxValue() {
          setupSelectCheckboxValue();
          selectIdleCheckboxValueAt(FacetSelectors, secondSelectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectSecondCheckboxValue);

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
          beforeEach(setupSelectSecondCheckboxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            setupSelectSecondCheckboxValue();
            pressClearButton(FacetSelectors);
          }

          describe('verify rendering', () => {
            beforeEach(setupClearCheckboxValues);

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
            CommonFacetAssertions.assertFocusHeader(FacetSelectors);
          });
          describe('verify analytics', () => {
            beforeEach(setupClearCheckboxValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'e';
        function setupSearchFor() {
          setupSelectCheckboxValue();
          typeFacetSearchQuery(FacetSelectors, query, true);
        }

        describe('verify rendering', () => {
          beforeEach(setupSearchFor);

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

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            AnalyticsTracker.reset();
            selectIdleCheckboxValueAt(FacetSelectors, 5);
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectSearchResult);

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
            beforeEach(setupSelectSearchResult);
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });

        describe('when clearing the facet search results', () => {
          function setupClearFacetSearchResults() {
            setupSearchFor();
            pressClearSearchButton(FacetSelectors);
          }

          describe('verify rendering', () => {
            beforeEach(setupClearFacetSearchResults);

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
        const query = 'people';
        function setupSearchForSingleValue() {
          setupSelectCheckboxValue();
          typeFacetSearchQuery(FacetSelectors, query, true);
        }

        describe('verify rendering', () => {
          beforeEach(setupSearchForSingleValue);

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
          typeFacetSearchQuery(FacetSelectors, query, false);
        }

        describe('verify rendering', () => {
          beforeEach(setupSearchForNoValues);

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

      describe('with #enableExclusion to true', () => {
        beforeEach(() => {
          new TestFixture()
            .with(addFacet({field, label, 'enable-exclusion': 'true'}))
            .init();
        });

        CommonFacetAssertions.assertDisplayTriStateCheckbox(FacetSelectors);
        CommonFacetAssertions.assertDisplayExcludeButton(FacetSelectors);
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
      beforeEach(setupWithLinkValues);

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
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectLinkValue);

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
        beforeEach(setupSelectLinkValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondLinkValue() {
          setupSelectLinkValue();
          selectIdleLinkValueAt(FacetSelectors, secondSelectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectSecondLinkValue);

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
          beforeEach(setupSelectSecondLinkValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearLinkValues() {
            setupSelectSecondLinkValue();
            pressClearButton(FacetSelectors);
          }

          describe('verify rendering', () => {
            beforeEach(setupClearLinkValues);

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
            beforeEach(setupClearLinkValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'e';
        function setupSearchFor() {
          setupSelectLinkValue();
          typeFacetSearchQuery(FacetSelectors, query, true);
        }

        describe('verify rendering', () => {
          beforeEach(setupSearchFor);

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

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            AnalyticsTracker.reset();
            selectIdleLinkValueAt(FacetSelectors, 5);
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectSearchResult);

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
            beforeEach(setupSelectSearchResult);
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
      beforeEach(setupWithBoxValues);

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
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectBoxValue);

        CommonAssertions.assertAccessibility(facetComponent);
        CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
        FacetAssertions.assertNumberOfSelectedBoxValues(1);
        FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        beforeEach(setupSelectBoxValue);
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          setupSelectBoxValue();
          selectIdleBoxValueAt(secondSelectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(setupSelectSecondBoxValue);

          CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
          FacetAssertions.assertNumberOfSelectedBoxValues(2);
          FacetAssertions.assertNumberOfIdleBoxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          beforeEach(setupSelectSecondBoxValue);

          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            setupSelectSecondBoxValue();
            pressClearButton(FacetSelectors);
          }

          describe('verify rendering', () => {
            beforeEach(setupClearBoxValues);

            CommonFacetAssertions.assertDisplayClearButton(
              FacetSelectors,
              false
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(0);
            FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          });

          describe('verify analytics', () => {
            beforeEach(setupClearBoxValues);

            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'e';
        function setupSearchFor() {
          setupSelectBoxValue();
          typeFacetSearchQuery(FacetSelectors, query, true);
        }

        describe('verify rendering', () => {
          beforeEach(setupSearchFor);

          CommonAssertions.assertAccessibility(facetComponent);
          FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          FacetAssertions.assertNumberOfSelectedBoxValues(0);
          CommonFacetAssertions.assertHighlightsResults(FacetSelectors, query);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            setupSearchFor();
            AnalyticsTracker.reset();
            selectIdleBoxValueAt(5);
          }

          describe('verify rendering', () => {
            beforeEach(setupSelectSearchResult);

            FacetAssertions.assertNumberOfIdleBoxValues(
              defaultNumberOfValues - 2
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(2);
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
          });

          describe('verify analytics', () => {
            beforeEach(setupSelectSearchResult);
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });
      });
    });
  });

  describe('when selecting the "Show more" button', () => {
    function setupSelectShowMore(sortCriteria?: string) {
      new TestFixture()
        .with(
          addFacet({
            field,
            label,
            ...(sortCriteria && {'sort-criteria': sortCriteria}),
          })
        )
        .init();
      pressShowMore(FacetSelectors);
    }

    describe('verify rendering', () => {
      beforeEach(() => setupSelectShowMore('automatic'));

      CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
      CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      FacetAssertions.assertValuesSortedAlphanumerically();
      CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues * 2
      );
      CommonFacetAssertions.assertFocusCheckboxValue(FacetSelectors, 0);
    });

    describe("when the sort order isn't automatic", () => {
      beforeEach(() => setupSelectShowMore('alphanumeric'));

      CommonFacetAssertions.assertFocusCheckboxValue(
        FacetSelectors,
        defaultNumberOfValues
      );
    });

    describe('verify analytics', () => {
      beforeEach(() => setupSelectShowMore());

      FacetAssertions.assertLogFacetShowMore(field);
      it('should include analytics in the v2 call', async () => {
        cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
          expect(firstSearch.request.body).to.have.property('analytics');
          const analyticsBody = firstSearch.request.body.analytics;
          expect(analyticsBody).to.have.property('eventType', 'facet');
          expect(analyticsBody).to.have.property(
            'eventValue',
            'showMoreFacetResults'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            field
          );
        });
      });
    });

    describe('when there\'s no more "Show more" button', () => {
      function setupRepeatShowMore() {
        new TestFixture().with(addFacet({field: 'month', label})).init();
        FacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }
      beforeEach(setupRepeatShowMore);

      describe('verify rendering', () => {
        CommonFacetAssertions.assertDisplayShowMoreButton(
          FacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, true);
      });
    });

    describe('when selecting the "Show less" button', () => {
      function setupSelectShowLess() {
        setupSelectShowMore();
        pressShowLess(FacetSelectors);
      }
      beforeEach(setupSelectShowLess);

      describe('verify rendering', () => {
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
        FacetAssertions.assertLogFacetShowLess(field);
      });
    });
  });

  describe('when selecting the label button to collapse', () => {
    function setupSelectLabelCollapse() {
      new TestFixture().with(addFacet({field, label})).init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
      pressLabelButton(FacetSelectors, true);
    }

    beforeEach(setupSelectLabelCollapse);

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
        FacetSelectors.labelButton().click();
      }

      beforeEach(setupSelectLabelExpand);

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

    beforeEach(setupCustomNumberOfValues);

    CommonFacetAssertions.assertNumberOfIdleCheckboxValues(
      FacetSelectors,
      numberOfValues
    );
    CommonFacetAssertions.assertDisplayShowMoreButton(FacetSelectors, true);
    CommonFacetAssertions.assertDisplayShowLessButton(FacetSelectors, false);

    describe('when selecting the "Show More" button', () => {
      beforeEach(() => {
        pressShowMore(FacetSelectors);
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
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'alphanumeric'}))
        .init();
    });

    FacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with custom #sortCriteria, alphanumericDescending', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({field, label, 'sort-criteria': 'alphanumericDescending'})
        )
        .init();
    });

    FacetAssertions.assertValuesSortedAlphanumericallyDescending();
  });

  describe('with custom #sortCriteria, occurrences', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurrences();
  });

  describe('with #resultsMustMatch set to "allValues"', () => {
    function setupSelectCheckboxValue() {
      new TestFixture()
        .with(addFacet({field, label, 'results-must-match': 'allValues'}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
    }

    beforeEach(() => {
      setupSelectCheckboxValue();
    });

    it('should set resultsMustMatch to `allValues`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((search) => {
        expect(search.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'allValues'
        );
      });
    });
  });

  describe('with #resultsMustMatch set to default value', () => {
    function setupSelectCheckboxValue() {
      new TestFixture().with(addFacet({field, label})).init();
      selectIdleCheckboxValueAt(FacetSelectors, 0);
    }

    beforeEach(() => {
      setupSelectCheckboxValue();
    });

    it('should set resultsMustMatch to `atLeastOneValue`', () => {
      cy.wait(TestFixture.interceptAliases.Search).should((search) => {
        expect(search.request.body.facets[0]).to.have.property(
          'resultsMustMatch',
          'atLeastOneValue'
        );
      });
    });
  });

  describe('when defining a value caption', () => {
    const caption = 'nicecaption';
    beforeEach(() => {
      const fixture = new TestFixture().with(addFacet({field, label})).init();
      cy.get(`@${fixture.elementAliases.SearchInterface}`).then(($si) => {
        const searchInterfaceComponent = $si.get()[0] as SearchInterface;

        searchInterfaceComponent.i18n.addResource(
          'en',
          `caption-${field}`,
          'People',
          caption
        );
      });

      typeFacetSearchQuery(FacetSelectors, caption, true);
    });

    CommonFacetAssertions.assertFirstValueContains(FacetSelectors, caption);
  });

  describe('with #withSearch to false', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'with-search': 'false'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, true);
    CommonFacetAssertions.assertDisplaySearchInput(FacetSelectors, false);
  });

  describe('when no search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, true);
  });

  describe('with an invalid option', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'nononono'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, true);
  });

  describe('when field returns no results', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field: 'notanactualfield', label}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(FacetSelectors, false);
    CommonFacetAssertions.assertDisplayPlaceholder(FacetSelectors, false);
    CommonAssertions.assertContainsComponentError(FacetSelectors, false);
  });

  describe('with a selected path in the URL', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label}))
        .withHash(`f-${field}=Cervantes`)
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

  describe('with breadbox', () => {
    function breadboxFactory(enableExclusion: boolean) {
      new TestFixture()
        .with(addBreadbox())
        .with(
          addFacet({field, label, 'enable-exclusion': String(enableExclusion)})
        )
        .init();
    }

    function setupBreadboxWithFacet() {
      breadboxFactory(false);
    }

    function setupBreadboxWithFacetWithExclusionEnabled() {
      breadboxFactory(true);
    }

    describe('verify rendering', () => {
      beforeEach(setupBreadboxWithFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectedFacet() {
        setupBreadboxWithFacet();
        selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
      }

      describe('verify rendering', () => {
        beforeEach(() => {
          setupSelectedFacet();
          cy.wait(TestFixture.interceptAliases.Search);
        });
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
          FacetSelectors
        );
        BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      });

      describe('when deselecting a facetValue on breadcrumb', () => {
        const deselectionIndex = 0;
        function setupDeselectFacetValue() {
          setupSelectedFacet();
          deselectBreadcrumbAtIndex(deselectionIndex);
        }

        describe('verify rendering', () => {
          beforeEach(() => {
            setupDeselectFacetValue();
            cy.wait(TestFixture.interceptAliases.Search);
          });
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
          beforeEach(setupDeselectFacetValue);
          BreadboxAssertions.assertLogBreadcrumbFacet(field);
        });

        describe('verify selected facetValue', () => {
          beforeEach(setupSelectedFacet);
          BreadboxAssertions.assertDeselectCheckboxFacet(
            FacetSelectors,
            deselectionIndex
          );
        });
      });
    });

    describe('when select 3 values', () => {
      const index = [0, 1, 2];
      function setupSelectedMultipleFacets() {
        setupBreadboxWithFacet();
        index.forEach((position, i) => {
          selectIdleCheckboxValueAt(FacetSelectors, position);
          cy.wait(TestFixture.interceptAliases.Search);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectedMultipleFacets);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
          FacetSelectors
        );
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(false);
        BreadboxAssertions.assertBreadcrumbDisplayLength(index.length);
      });
    });

    describe('when excluding 3 values', () => {
      const index = [0, 1, 2];
      function setupSelectedMultipleFacets() {
        setupBreadboxWithFacetWithExclusionEnabled();
        index.forEach((position, i) => {
          excludeIdleCheckboxValueAt(FacetSelectors, position);
          cy.wait(TestFixture.interceptAliases.Search);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectedMultipleFacets);
        CommonAssertions.assertAccessibility(breadboxComponent);
        BreadboxAssertions.assertDisplayBreadcrumb(true);
        BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
        BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
        BreadboxAssertions.assertExcludedCheckboxFacetsInBreadcrumb(
          FacetSelectors
        );
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(false);
        BreadboxAssertions.assertBreadcrumbDisplayLength(index.length);
      });
    });
  });

  describe('with depends-on', () => {
    describe('as a dependent & parent', () => {
      const facetId = 'abc';
      const parentFacetId = 'def';
      const parentField = 'filetype';
      const expectedValue = 'txt';
      beforeEach(() => {
        new TestFixture()
          .with(
            addFacet({
              'facet-id': facetId,
              field,
              [`depends-on-${parentFacetId}`]: expectedValue,
            })
          )
          .with(addFacet({'facet-id': parentFacetId, field: parentField}))
          .init();
      });

      it('should control display of both parent and child properly', () => {
        FacetSelectors.withId(facetId).wrapper().should('not.exist');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });

      it('should control the display of both parent and child properly when the dependency is met', () => {
        typeFacetSearchQuery(
          FacetSelectors.withId(parentFacetId),
          expectedValue,
          true
        );
        selectIdleCheckboxValueAt(FacetSelectors.withId(parentFacetId), 0);
        FacetSelectors.withId(facetId).wrapper().should('be.visible');
        FacetSelectors.withId(parentFacetId).wrapper().should('be.visible');
      });
    });

    describe('with two dependencies', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addFacet({'facet-id': 'abc', field: 'objecttype'}))
          .with(addFacet({'facet-id': 'def', field: 'filetype'}))
          .with(
            addFacet({
              'facet-id': 'ghi',
              field,
              'depends-on-objecttype': '',
              'depends-on-filetype': 'pdf',
            })
          )
          .init();
      });

      CommonAssertions.assertConsoleError(true);
      CommonAssertions.assertContainsComponentError(
        FacetSelectors.withId('ghi'),
        true
      );
    });
  });

  describe('with allowed-values', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({
            field: 'objecttype',
            'allowed-values': JSON.stringify(['FAQ', 'People']),
          })
        )
        .init();
    });

    it('returns only allowed values', () => {
      FacetSelectors.values()
        .should('contain.text', 'FAQ')
        .should('contain.text', 'People')
        .should('not.contain.text', 'Page');
    });
  });

  describe('with custom-sort', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacet({
            field: 'filetype',
            'custom-sort': JSON.stringify(['txt', 'rssitem']),
          })
        )
        .init();
    });

    it('returns values sorted in the proper order', () => {
      FacetSelectors.valueLabel().eq(0).should('contain.text', 'txt');
      FacetSelectors.valueLabel().eq(1).should('contain.text', 'rssitem');
    });
  });
});
