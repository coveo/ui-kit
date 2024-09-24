import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addBreadbox,
  breadboxLabel,
  deselectBreadcrumbAtIndex,
} from '../../breadbox-actions';
import * as BreadboxAssertions from '../../breadbox-assertions';
import {breadboxComponent, BreadboxSelectors} from '../../breadbox-selectors';
import * as CommonAssertions from '../../common-assertions';
import {
  selectIdleCheckboxValueAt,
  typeFacetSearchQuery,
  excludeIdleCheckboxValueAt,
} from '../facet-common-actions';
import {addFacet, field, label} from './facet-actions';

describe('Facet Test Suite 3', () => {
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

  it('should use the Coveo platform defined label when none is provided', () => {
    new TestFixture().with(addFacet({field: 'objecttype'})).init();
    // The label Object type is defined in the Coveo administration tool for the organization searchuisamples
    FacetSelectors.labelButton().should('contain.text', 'Object type');
  });

  it('should use No label when none is provided and there is no fallback configured in the Coveo platform', () => {
    new TestFixture().with(addFacet({field: 'filetype'})).init();
    FacetSelectors.labelButton().should('contain.text', 'No label');
  });
});
