import {TestFixture} from '../../../../fixtures/test-fixture';
import {AnalyticsTracker} from '../../../../utils/analyticsUtils';
import * as CommonAssertions from '../../../common-assertions';
import {
  pressClearButton,
  selectIdleLinkValueAt,
  typeFacetSearchQuery,
} from '../../facet-common-actions';
import * as CommonFacetAssertions from '../../facet-common-assertions';
import {addFacet, field, label, defaultNumberOfValues} from '../facet-actions';
import * as FacetAssertions from '../facet-assertions';
import {facetComponent, FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
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
});
