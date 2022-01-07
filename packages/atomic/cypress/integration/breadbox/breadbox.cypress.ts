import {TestFixture} from '../../fixtures/test-fixture';
import {
  addColorFacet,
  colorFacetField,
  colorFacetLabel,
  selectIdleBoxValueAt,
} from '../facets/color-facet/color-facet-actions';
import {addFacet, field, label} from '../facets/facet/facet-actions';
import {FacetSelectors} from '../facets/facet/facet-selectors';

import {
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
} from '../facets/facet-common-actions';
import {addBreadbox, breadboxLabel} from './breadbox-actions';
import * as BreadboxAssertions from './breadbox-assertions';
import * as CommonAssertions from '../common-assertions';
import * as CommonFacetAssertions from '../facets/facet-common-assertions';
import * as CategoryFacetAssertions from '../facets/category-facet/category-facet-assertions';
import * as ColorFacetAssertions from '../facets/color-facet/color-facet-assertions';
import {breadboxComponent, BreadboxSelectors} from './breadbox-selectors';
import {
  addCategoryFacet,
  canadaHierarchy,
  canadaHierarchyIndex,
  selectChildValueAt,
} from '../facets/category-facet/category-facet-actions';
import {
  addNumericFacet,
  numericFacetField,
  numericFacetLabel,
} from '../facets/numeric-facet/numeric-facet-actions';
import {
  addTimeframeFacet,
  timeframeFacetLabel,
  unitFrames,
} from '../facets/timeframe-facet/timeframe-facet-action';
import {TimeframeFacetSelectors} from '../facets/timeframe-facet/timeframe-facet-selectors';
import {NumericFacetSelectors} from '../facets/numeric-facet/numeric-facet-selectors';
import {waitUntilNextSearchRendered} from '../common-actions';

describe('Breadbox Test Suites', () => {
  function setupBreadboxWithMultipleFacets() {
    new TestFixture()
      .with(addBreadbox())
      .with(addFacet({field, label}))
      .with(
        addNumericFacet({field: numericFacetField, label: numericFacetLabel})
      )
      .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
      .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
      .with(addCategoryFacet())
      .init();
  }

  describe('when selecting a standard facet and a numeric facet', () => {
    const selectionIndex = 0;
    function setupBreadboxWithSelectedFacetAndNumericFacet() {
      setupBreadboxWithMultipleFacets();
      selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
      waitUntilNextSearchRendered();
      selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
      waitUntilNextSearchRendered();
    }

    describe('verify rendering', () => {
      before(setupBreadboxWithSelectedFacetAndNumericFacet);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
      BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
      BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
        FacetSelectors
      );
      BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
        NumericFacetSelectors,
        numericFacetLabel
      );
      BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      BreadboxAssertions.assertBreadcrumbDisplayLength(2);
    });

    describe('when selecting "Clear all" button', () => {
      function setupClearAllBreadcrumb() {
        setupBreadboxWithSelectedFacetAndNumericFacet();
        BreadboxSelectors.clearAllButton().click();
        waitUntilNextSearchRendered();
      }

      describe('verify rendering', () => {
        before(setupClearAllBreadcrumb);
        BreadboxAssertions.assertDisplayBreadcrumb(false);
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          FacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          NumericFacetSelectors,
          0
        );
        ColorFacetAssertions.assertNumberOfSelectedBoxValues(0);
        CategoryFacetAssertions.assertNumberOfParentValues(0);
        CommonFacetAssertions.assertNumberOfSelectedLinkValues(
          TimeframeFacetSelectors,
          0
        );
      });

      describe('verify analytics', () => {
        before(setupClearAllBreadcrumb);
        BreadboxAssertions.assertLogBreadcrumbClearAll();
      });
    });
  });

  describe('when selecting a category facet, a color facet and a timeframe facet', () => {
    function setupBreadboxWithDifferentTypeSelectedFacet() {
      const selectionIndex = 0;
      setupBreadboxWithMultipleFacets();
      selectChildValueAt(canadaHierarchyIndex[0]);
      waitUntilNextSearchRendered();
      selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
      waitUntilNextSearchRendered();
      selectIdleBoxValueAt(selectionIndex);
      waitUntilNextSearchRendered();
    }
    describe('verify rendering', () => {
      before(setupBreadboxWithDifferentTypeSelectedFacet);
      const selectedPath = canadaHierarchy.slice(0, 1);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertSelectedColorFacetsInBreadcrumb();
      BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
        TimeframeFacetSelectors
      );
      BreadboxAssertions.assertCategoryPathInBreadcrumb(selectedPath);
      BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      BreadboxAssertions.assertBreadcrumbDisplayLength(3);
    });
  });

  describe('when selecting 12 facet values', () => {
    const index = [1, 2, 0, 2, 0, 1, 2, 0, 2, 0, 1, 2];
    function setupSelectedMulitpleFacets() {
      setupBreadboxWithMultipleFacets();
      FacetSelectors.showMoreButton().click();
      waitUntilNextSearchRendered();
      index.forEach((i: number) => {
        selectIdleCheckboxValueAt(FacetSelectors, i);
        waitUntilNextSearchRendered();
      });
    }

    describe('verify rendering', () => {
      before(setupSelectedMulitpleFacets);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
      BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
      BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
        FacetSelectors
      );
      BreadboxAssertions.assertBreadcrumbDisplayLength(index.length);
      BreadboxAssertions.assertDisplayBreadcrumbShowMore(true);
    });

    describe('when selecting "+" show more breadcrumb', () => {
      before(() => {
        setupSelectedMulitpleFacets();
        BreadboxSelectors.breadcrumbShowMoreButton().click();
      });

      describe('verify rendering', () => {
        BreadboxAssertions.assertRemoveBreadcrumbShowMoreInDOM();
        BreadboxAssertions.assertDisplayBreadcrumbShowLess(true);
        BreadboxAssertions.assertDisplayAllBreadcrumb(true);
      });
    });

    describe('when selecting "-" show less breadcrumb', () => {
      before(() => {
        setupSelectedMulitpleFacets();
        BreadboxSelectors.breadcrumbShowMoreButton().click();
        BreadboxSelectors.breadcrumbShowLessButton().click();
      });

      describe('verify rendering', () => {
        BreadboxAssertions.assertDisplayBreadcrumbShowLess(false);
        BreadboxAssertions.assertDisplayBreadcrumbShowMore(true);
        BreadboxAssertions.assertDisplayAllBreadcrumb(false);
      });
    });
  });
});
