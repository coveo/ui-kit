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
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectCheckboxValue() {
        setupWithCheckboxValues();
        selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
      }
      beforeEach(setupSelectCheckboxValue);
      describe('verify rendering', () => {
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
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondCheckboxValue() {
          selectIdleCheckboxValueAt(FacetSelectors, secondSelectionIndex);
        }

        beforeEach(setupSelectSecondCheckboxValue);
        describe('verify rendering', () => {
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
          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearCheckboxValues() {
            pressClearButton(FacetSelectors);
          }
          beforeEach(setupClearCheckboxValues);

          describe('verify rendering', () => {
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
            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'e';
        function setupSearchFor() {
          typeFacetSearchQuery(FacetSelectors, query, true);
        }

        beforeEach(setupSearchFor);
        describe('verify rendering', () => {
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
            AnalyticsTracker.reset();
            selectIdleCheckboxValueAt(FacetSelectors, 5);
          }
          beforeEach(setupSelectSearchResult);
          describe('verify rendering', () => {
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
            FacetAssertions.assertLogFacetSelect(field, 0);
          });
        });

        describe('when clearing the facet search results', () => {
          function setupClearFacetSearchResults() {
            pressClearSearchButton(FacetSelectors);
          }
          beforeEach(setupClearFacetSearchResults);
          describe('verify rendering', () => {
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
          typeFacetSearchQuery(FacetSelectors, query, true);
        }
        beforeEach(setupSearchForSingleValue);
        describe('verify rendering', () => {
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
          typeFacetSearchQuery(FacetSelectors, query, false);
        }
        beforeEach(setupSearchForNoValues);
        describe('verify rendering', () => {
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
    beforeEach(setupWithLinkValues);

    describe('verify rendering', () => {
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
        selectIdleLinkValueAt(FacetSelectors, selectionIndex);
      }
      beforeEach(setupSelectLinkValue);

      describe('verify rendering', () => {
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
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondLinkValue() {
          selectIdleLinkValueAt(FacetSelectors, secondSelectionIndex);
        }
        beforeEach(setupSelectSecondLinkValue);

        describe('verify rendering', () => {
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
          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearLinkValues() {
            pressClearButton(FacetSelectors);
          }
          beforeEach(setupClearLinkValues);

          describe('verify rendering', () => {
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
        beforeEach(setupSearchFor);
        describe('verify rendering', () => {
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
            AnalyticsTracker.reset();
            selectIdleLinkValueAt(FacetSelectors, 5);
          }
          beforeEach(setupSelectSearchResult);

          describe('verify rendering', () => {
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
    beforeEach(setupWithBoxValues);
    describe('verify rendering', () => {
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
        selectIdleBoxValueAt(selectionIndex);
      }
      beforeEach(setupSelectBoxValue);

      describe('verify rendering', () => {
        CommonAssertions.assertAccessibility(facetComponent);
        CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
        FacetAssertions.assertNumberOfSelectedBoxValues(1);
        FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        FacetAssertions.assertLogFacetSelect(field, selectionIndex);
      });

      describe('when selecting a second value', () => {
        const secondSelectionIndex = 0;
        function setupSelectSecondBoxValue() {
          selectIdleBoxValueAt(secondSelectionIndex);
        }
        beforeEach(setupSelectSecondBoxValue);

        describe('verify rendering', () => {
          CommonFacetAssertions.assertDisplayClearButton(FacetSelectors, true);
          FacetAssertions.assertNumberOfSelectedBoxValues(2);
          FacetAssertions.assertNumberOfIdleBoxValues(
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          FacetAssertions.assertLogFacetSelect(field, secondSelectionIndex);
        });

        describe('when selecting the "Clear" button', () => {
          function setupClearBoxValues() {
            pressClearButton(FacetSelectors);
          }
          beforeEach(setupClearBoxValues);

          describe('verify rendering', () => {
            CommonFacetAssertions.assertDisplayClearButton(
              FacetSelectors,
              false
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(0);
            FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          });

          describe('verify analytics', () => {
            CommonFacetAssertions.assertLogClearFacetValues(field);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'e';
        function setupSearchFor() {
          typeFacetSearchQuery(FacetSelectors, query, true);
        }
        beforeEach(setupSearchFor);

        describe('verify rendering', () => {
          CommonAssertions.assertAccessibility(facetComponent);
          FacetAssertions.assertNumberOfIdleBoxValues(defaultNumberOfValues);
          FacetAssertions.assertNumberOfSelectedBoxValues(0);
          CommonFacetAssertions.assertHighlightsResults(FacetSelectors, query);
        });

        describe('when selecting a search result', () => {
          function setupSelectSearchResult() {
            AnalyticsTracker.reset();
            selectIdleBoxValueAt(5);
          }
          beforeEach(setupSelectSearchResult);

          describe('verify rendering', () => {
            FacetAssertions.assertNumberOfIdleBoxValues(
              defaultNumberOfValues - 2
            );
            FacetAssertions.assertNumberOfSelectedBoxValues(2);
            CommonFacetAssertions.assertSearchInputEmpty(FacetSelectors);
          });

          describe('verify analytics', () => {
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
    beforeEach(() => setupSelectShowMore('automatic'));

    describe('verify rendering', () => {
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
      beforeEach(() => {
        setupCustomNumberOfValues();
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

  describe('with custom #sortCriteria, occurrences', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addFacet({field, label, 'sort-criteria': 'occurrences'}))
        .init();
    });

    FacetAssertions.assertValuesSortedByOccurrences();
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
    function setupBreadboxWithFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field, label}))
        .init();
    }
    beforeEach(setupBreadboxWithFacet);

    describe('verify rendering', () => {
      BreadboxAssertions.assertDisplayBreadcrumb(false);
    });

    describe('when selecting a value', () => {
      const selectionIndex = 2;
      function setupSelectedFacet() {
        selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
        cy.wait(TestFixture.interceptAliases.Search);
      }
      beforeEach(setupSelectedFacet);

      describe('verify rendering', () => {
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
          deselectBreadcrumbAtIndex(deselectionIndex);
          cy.wait(TestFixture.interceptAliases.Search);
        }
        beforeEach(setupDeselectFacetValue);

        describe('verify rendering', () => {
          BreadboxAssertions.assertDisplayBreadcrumb(false);
        });

        describe('verify analytic', () => {
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
      function setupSelectedMulitpleFacets() {
        setupBreadboxWithFacet();
        index.forEach((position, i) => {
          selectIdleCheckboxValueAt(FacetSelectors, position);
          cy.wait(TestFixture.interceptAliases.Search);
          BreadboxSelectors.breadcrumbButton().should('have.length', i + 1);
        });
      }
      beforeEach(setupSelectedMulitpleFacets);

      describe('verify rendering', () => {
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
            'allowed-values': JSON.stringify(['FAQ', 'File']),
          })
        )
        .init();
    });

    it('returns only allowed values', () => {
      FacetSelectors.values()
        .should('contain.text', 'FAQ')
        .should('contain.text', 'File')
        .should('not.contain.text', 'Message');
    });
  });
});
