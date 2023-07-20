import {TagProps, TestFixture} from '../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectAllBreadcrumbs,
} from './breadbox-actions';
import * as BreadboxAssertions from './breadbox-assertions';
import {breadboxComponent, BreadboxSelectors} from './breadbox-selectors';
import * as CommonAssertions from './common-assertions';
import {addAutomaticFacetBuilder} from './facets/automatic-facet-builder/automatic-facet-builder-actions';
import {AutomaticFacetSelectors} from './facets/automatic-facet/automatic-facet-selectors';
import {
  addCategoryFacet,
  canadaHierarchy,
  canadaHierarchyIndex,
  selectChildValueAt as selectCategoryFacetChildValueAt,
} from './facets/category-facet/category-facet-actions';
import * as CategoryFacetAssertions from './facets/category-facet/category-facet-assertions';
import {
  addColorFacet,
  colorFacetField,
  colorFacetLabel,
  selectIdleBoxValueAt as selectColorFacetIdleBoxValueAt,
} from './facets/color-facet/color-facet-actions';
import * as ColorFacetAssertions from './facets/color-facet/color-facet-assertions';
import {
  selectIdleCheckboxValueAt,
  selectIdleLinkValueAt,
} from './facets/facet-common-actions';
import * as CommonFacetAssertions from './facets/facet-common-assertions';
import {addFacet, label} from './facets/facet/facet-actions';
import {FacetSelectors} from './facets/facet/facet-selectors';
import {
  addNumericFacet,
  numericFacetField,
  numericFacetLabel,
} from './facets/numeric-facet/numeric-facet-actions';
import {NumericFacetSelectors} from './facets/numeric-facet/numeric-facet-selectors';
import {
  addTimeframeFacet,
  timeframeFacetLabel,
  unitFrames,
} from './facets/timeframe-facet/timeframe-facet-action';
import {TimeframeFacetSelectors} from './facets/timeframe-facet/timeframe-facet-selectors';

describe('Breadbox Test Suites', () => {
  function setupBreadboxWithMultipleFacets(props: TagProps = {}) {
    new TestFixture()
      .withTranslation({'a.translated.label': 'This is a translated label'})
      .with(addBreadbox())
      .with(addFacet({field: 'author', label, ...props}))
      .with(
        addNumericFacet({field: numericFacetField, label: numericFacetLabel})
      )
      .with(addTimeframeFacet({label: timeframeFacetLabel}, unitFrames))
      .with(addColorFacet({field: colorFacetField, label: colorFacetLabel}))
      .with(addCategoryFacet())
      .with(
        addAutomaticFacetBuilder({
          'desired-count': '1',
          'are-collapsed': 'false',
        })
      )

      .init();
  }

  describe('when selecting a standard facet, a numeric facet and an automatic facet', () => {
    const selectionIndex = 2;
    function setupBreadboxWithSelectedFacetAndNumericFacet(
      props: TagProps = {}
    ) {
      setupBreadboxWithMultipleFacets(props);
      selectIdleCheckboxValueAt(NumericFacetSelectors, selectionIndex);
      selectIdleCheckboxValueAt(FacetSelectors, selectionIndex);
      selectIdleCheckboxValueAt(AutomaticFacetSelectors, selectionIndex);
    }

    describe('with i18n translated labels', () => {
      beforeEach(() =>
        setupBreadboxWithSelectedFacetAndNumericFacet({
          label: 'a.translated.label',
        })
      );

      it('should have the proper button label', () => {
        BreadboxSelectors.breadcrumbButton().should(
          'contain.text',
          'This is a translated label'
        );
      });
    });

    describe('verify rendering', () => {
      beforeEach(() => setupBreadboxWithSelectedFacetAndNumericFacet());
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
        deselectAllBreadcrumbs();
      }

      describe('verify rendering', () => {
        beforeEach(setupClearAllBreadcrumb);
        BreadboxAssertions.assertDisplayBreadcrumb(false);
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          FacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          NumericFacetSelectors,
          0
        );
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          AutomaticFacetSelectors,
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
        beforeEach(setupClearAllBreadcrumb);
        BreadboxAssertions.assertLogBreadcrumbClearAll();
      });
    });
  });

  describe('when selecting a category facet, a color facet and a timeframe facet', () => {
    function setupBreadboxWithDifferentTypeSelectedFacet() {
      const selectionIndex = 0;
      setupBreadboxWithMultipleFacets();
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
      BreadboxAssertions.assertDisplayBreadcrumbClearIcon();
      BreadboxAssertions.assertBreadcrumbDisplayLength(3);
    });
  });

  describe('when selecting 16 facet values', () => {
    const activeValues = [...Array(16).keys()];

    function setupFacetWithMultipleSelectedValues() {
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field: 'author', label}))
        .withHash(`f-author=${activeValues.join(',')}`)
        .init();
      BreadboxSelectors.breadcrumbButton().then((buttons) =>
        cy.wrap(buttons.filter(':visible').length).as('numberOfVisibleButtons')
      );
    }

    describe('verify rendering', () => {
      beforeEach(setupFacetWithMultipleSelectedValues);
      CommonAssertions.assertAccessibility(breadboxComponent);
      BreadboxAssertions.assertDisplayBreadcrumb(true);
      BreadboxAssertions.assertDisplayBreadcrumbClearAllButton(true);
      BreadboxAssertions.assertBreadcrumbLabel(breadboxLabel);
      BreadboxAssertions.assertSelectedCheckboxFacetsInBreadcrumb(
        FacetSelectors
      );
      BreadboxAssertions.assertBreadcrumbDisplayLength(activeValues.length);
      BreadboxAssertions.assertDisplayBreadcrumbShowMore(true);
    });

    describe('when selecting "+" show more breadcrumb', () => {
      function setupFacetWithMultipleSelectedValuesAndShowMore() {
        setupFacetWithMultipleSelectedValues();
        BreadboxSelectors.breadcrumbShowMoreButton().click();
      }

      describe('verify rendering', () => {
        beforeEach(setupFacetWithMultipleSelectedValuesAndShowMore);

        BreadboxAssertions.assertRemoveBreadcrumbShowMoreInDOM();
        BreadboxAssertions.assertDisplayBreadcrumbShowLess(true);
        BreadboxAssertions.assertDisplayAllBreadcrumb(true);
      });
    });

    describe('when selecting "-" show less breadcrumb', () => {
      beforeEach(() => {
        setupFacetWithMultipleSelectedValues();
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
