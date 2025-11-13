import {TagProps, TestFixture} from '../fixtures/test-fixture';
import {
  addBreadbox,
  deselectAllBreadcrumbs,
} from './breadbox-actions';
import * as BreadboxAssertions from './breadbox-assertions';
import {BreadboxSelectors} from './breadbox-selectors';
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

describe('Breadbox Test Suites - Internal & Analytics', () => {
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

    describe('verify automatic facet integration', () => {
      beforeEach(() => setupBreadboxWithMultipleSelectedFacets());
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

    describe('verify specialized facet breadcrumb integration', () => {
      beforeEach(setupBreadboxWithDifferentTypeSelectedFacet);
      const selectedPath = canadaHierarchy.slice(0, 1);
      
      BreadboxAssertions.assertSelectedColorFacetsInBreadcrumb();
      BreadboxAssertions.assertSelectedLinkFacetsInBreadcrumb(
        TimeframeFacetSelectors
      );
      BreadboxAssertions.assertCategoryPathInBreadcrumb(selectedPath);
      BreadboxAssertions.assertBreadcrumbDisplayLength(3);
    });
  });

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

  describe('when excluding from a standard facet', () => {
    const selectionIndex = 1;

    function setupFacetWithMultipleExcludedValues() {
      new TestFixture()
        .with(addBreadbox())
        .with(addFacet({field: 'author', label, 'enable-exclusion': 'true'}))
        .init();
      excludeIdleCheckboxValueAt(FacetSelectors, selectionIndex);
    }

    describe('verify exclusion-specific breadcrumb logic', () => {
      beforeEach(setupFacetWithMultipleExcludedValues);
      BreadboxAssertions.assertExcludedCheckboxFacetsInBreadcrumb(
        FacetSelectors
      );
      BreadboxAssertions.assertAriaLabel('exclusion');
    });
  });

  describe('when using invalid path-limit', () => {
    function setupBreadboxWithPathLimit(props: TagProps = {}) {
      new TestFixture()
        .with(addBreadbox(props))
        .with(addCategoryFacet())
        .init();
      selectCategoryFacetChildValueAt(canadaHierarchyIndex[0]);
    }

    describe('when path-limit is lower than minimum allowed', () => {
      const pathLimit = 0;
      beforeEach(() => {
        setupBreadboxWithPathLimit({'path-limit': pathLimit});
      });
      CommonAssertions.assertConsoleError();
    });
  });
});
