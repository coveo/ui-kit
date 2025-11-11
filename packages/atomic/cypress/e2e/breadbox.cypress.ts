import {TagProps, TestFixture} from '../fixtures/test-fixture';
import {
  addBreadbox,
  deselectAllBreadcrumbs,
} from './breadbox-actions';
import * as BreadboxAssertions from './breadbox-assertions';
import {breadboxComponent, BreadboxSelectors} from './breadbox-selectors';
import * as CommonAssertions from './common-assertions';
import {addAutomaticFacetGenerator} from './facets/automatic-facet-generator/automatic-facet-generator-actions';
import {AutomaticFacetSelectors} from './facets/automatic-facet/automatic-facet-selectors';
import {
  addCategoryFacet,
  canadaHierarchy,
  canadaHierarchyIndex,
  selectChildValueAt as selectCategoryFacetChildValueAt,
} from './facets/category-facet/category-facet-actions';
import {
  addColorFacet,
  colorFacetField,
  colorFacetLabel,
  selectIdleBoxValueAt as selectColorFacetIdleBoxValueAt,
} from './facets/color-facet/color-facet-actions';
import {
  excludeIdleCheckboxValueAt,
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
} from './facets/facet-common-actions';
import {addFacet, label} from './facets/facet/facet-actions';
import {FacetSelectors} from './facets/facet/facet-selectors';
import {
  addNumericFacet,
  numericFacetField,
  numericFacetLabel,
} from './facets/numeric-facet/numeric-facet-actions';
import {
  addTimeframeFacet,
  timeframeFacetLabel,
  unitFrames,
} from './facets/timeframe-facet/timeframe-facet-action';
import {TimeframeFacetSelectors} from './facets/timeframe-facet/timeframe-facet-selectors';

describe('Breadbox Test Suites - Specialized Scenarios', () => {
  // Test automatic facet generator breadcrumbs (not covered in Playwright)
  describe('when selecting an automatic facet', () => {
    const selectionIndex = 2;
    function setupBreadboxWithMultipleSelectedFacets() {
      new TestFixture()
        .withTranslation({'a.translated.label': 'This is a translated label'})
        .with(addBreadbox())
        .with(addFacet({field: 'author', label}))
        .with(
          addAutomaticFacetGenerator({
            'desired-count': '1',
          })
        )
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
    }

    describe('verify rendering', () => {
      beforeEach(() => setupBreadboxWithMultipleSelectedFacets());
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      CommonAssertions.assertAccessibility(breadboxComponent);
      it('should display the selected automatic facet in breadcrumbs', () => {
        AutomaticFacetSelectors.labelButton()
          .invoke('text')
          .then((facetLabel) => {
            BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumbAssertions(
              FacetSelectors,
              facetLabel
            );
          });
      });
    });

    describe('when selecting "Clear all" button', () => {
      beforeEach(() => {
        setupBreadboxWithMultipleSelectedFacets();
        deselectAllBreadcrumbs();
      });

      describe('verify analytics', () => {
        BreadboxAssertions.assertLogBreadcrumbClearAll();
      });
    });
  });

  // Test specific facet types (not covered in Playwright)
  describe('when selecting category facet, color facet and timeframe facet', () => {
    function setupBreadboxWithDifferentTypeSelectedFacet() {
      const selectionIndex = 0;
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field: 'author', label}))
        .with(
          addNumericFacet({field: numericFacetField, label: numericFacetLabel})
        )
        .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
        .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
        .with(addCategoryFacet())
        .init();
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[0]);
      selectIdleLinkValueAt(TimeframeFacetSelectors, selectionIndex);
      selectColorFacetIdleBoxValueAt(selectionIndex);
    }

    describe('verify rendering', () => {
      beforeEach(setupBreadboxWithDifferentTypeSelectedFacet);
      const selectedPath = canadaHierarchy.slice(0, 1);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertSelectedColorFacetsInBreadcrumb();
      BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
        TimeframeFacetSelectors
      );
      BreadboxAssertions.assertCategoryPathInBreadcrumb(selectedPath);
      BreadboxAssertions.assertBreadcrumbDisplayLength(3);
    });
  });

  // Test i18n functionality (not covered in Playwright)
  describe('with i18n translated labels', () => {
    beforeEach(() => {
      new TestFixture()
        .withTranslation({'a.translated.label': 'This is a translated label'})
        .with(addBreadbox())
        .with(addFacet({field: 'author', label: 'a.translated.label'}))
        .init();
      selectIdleCheckboxValueAt(FacetSelectors, 2);
    });

    it('should have the proper translated button label', () => {
      BreadboxSelectors.breadcrumbButton().should(
        'contain.text',
        'This is a translated label'
      );
    });
  });

  // Test exclusion filters (not covered in Playwright)
  describe('when excluding from a standard facet', () => {
    const selectionIndex = 1;

    function setupFacetWithMultipleExcludedValues() {
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field: 'author', label, 'enable-exclusion': 'true'}))
        .init();
      excludeIdleCheckboxValueAt(FacetSelectors, selectionIndex);
    }

    describe('verify rendering', () => {
      beforeEach(setupFacetWithMultipleExcludedValues);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      BreadboxAssertions.assertExcludedCheckboxFacetsInBreadcrumb(
        FacetSelectors
      );
      BreadboxAssertions.assertAriaLabel('exclusion');
    });
  });

  describe('when using path-limit', () => {
    const SEPARATOR = ' / ';
    const ELLIPSIS = '...';

    function setupBreadboxWithPathLimit(props: TagProps = {}) {
      new TestFixture()
        .with(addBreadbox(props))
        .with(addCategoryFacet())
        .init();
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[0]);
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[1]);
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[2]);
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[3]);
    }

    describe('when path-limit is lower than min', () => {
      const pathLimit = 0;
      beforeEach(() => {
        setupBreadboxWithPathLimit({'path-limit': pathLimit});
      });
      CommonAssertions.assertConsoleError();
    });

    describe('when path-limit is low enough to truncate the path', () => {
      const pathLimit = 3;
      beforeEach(() => {
        setupBreadboxWithPathLimit({'path-limit': pathLimit});
      });

      const ellipsedPath = [
        canadaHierarchy[0],
        ELLIPSIS,
        ...canadaHierarchy.slice(-(3 - 1)),
      ];
      const value = ellipsedPath.join(SEPARATOR);
      BreadboxAssertions.assertBreadcrumbButtonValue(value);
    });

    describe('when path-limit is high enough to not truncate path', () => {
      const pathLimit = 5;
      beforeEach(() => {
        setupBreadboxWithPathLimit({'path-limit': pathLimit});
      });

      const value = canadaHierarchy.join(SEPARATOR);
      BreadboxAssertions.assertBreadcrumbButtonValue(value);
    });
  });
});
