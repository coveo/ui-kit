import {TestFixture} from '../../../../fixtures/test-fixture';
import {AnalyticsTracker} from '../../../../utils/analyticsUtils';
import * as CommonAssertions from '../../../common-assertions';
import {
  pressClearButton,
  typeFacetSearchQuery,
} from '../../facet-common-actions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {
  addFacet,
  field,
  label,
  defaultNumberOfValues,
  selectIdleBoxValueAt,
} from '../facet-actions';
import * as FacetAssertions from '../facet-assertions';
import {facetComponent, FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
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
});
