import {TestFixture} from '../../../../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../../breadbox-actions';
import * as BreadboxAssertions from '../../../breadbox-assertions';
import {
  BreadboxSelectors,
  breadboxComponent,
} from '../../../breadbox-selectors';
import * as CommonAssertions from '../../../common-assertions';
import {selectIdleCheckboxValueAt} from '../../facet-common-actions';
import {addFacet, field, label} from '../facet-actions';
import {FacetSelectors} from '../facet-selectors';

describe('Facet v1 Test Suites', () => {
  describe('with breadbox', () => {
    function setupBreadboxWithFacet() {
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field, label}))
        .init();
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
  });
});
