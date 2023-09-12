import {TestFixture} from '../../../../fixtures/test-fixture';
import {AnalyticsTracker} from '../../../../utils/analyticsUtils';
import * as CommonAssertions from '../../../common-assertions';
import {
  selectIdleCheckboxValueAt,
  pressClearButton,
  typeFacetSearchQuery,
  pressClearSearchButton,
} from '../../facet-common-actions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label, defaultNumberOfValues} from '../facet-actions';
import * as FacetAssertions from '../facet-assertions';
import {facetComponent, FacetSelectors} from '../facet-selectors';

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
    });
  });
});
