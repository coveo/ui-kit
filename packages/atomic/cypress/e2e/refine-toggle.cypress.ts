import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {categoryFacetComponent} from './facets/category-facet/category-facet-selectors';
import {colorFacetComponent} from './facets/color-facet/color-facet-selectors';
import {facetComponent} from './facets/facet/facet-selectors';
import {facetManagerComponent} from './facets/manager/facet-manager-actions';
import {numericFacetComponent} from './facets/numeric-facet/numeric-facet-selectors';
import {ratingFacetComponent} from './facets/rating-facet/rating-facet-selectors';
import {ratingRangeFacetComponent} from './facets/rating-range-facet/rating-range-facet-selectors';
import {timeframeFacetComponent} from './facets/timeframe-facet/timeframe-facet-selectors';
import {
  addRefineToggle,
  addRefineToggleRangeVariations,
} from './refine-toggle-actions';
import {
  refineModalComponent,
  RefineModalSelectors,
  RefineToggleSelectors,
} from './refine-toggle-selectors';

describe('Refine Toggle Test Suites', () => {
  describe('when the modal is closed', () => {
    beforeEach(() => {
      new TestFixture().with(addRefineToggle()).withMobileViewport().init();
    });

    CommonAssertions.assertContainsComponentError(RefineToggleSelectors, false);
    CommonAssertions.assertConsoleError(false);

    it('should display a button', () => {
      RefineToggleSelectors.buttonOpen()
        .should('be.visible')
        .should('have.text', 'Sort & Filter');
    });
  });

  describe('when the modal is opened', () => {
    beforeEach(() => {
      new TestFixture().with(addRefineToggle()).withMobileViewport().init();
      RefineToggleSelectors.buttonOpen().click();
    });

    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility(refineModalComponent);

    it('should modify body className', () => {
      cy.get('body').should('have.class', 'atomic-modal-opened');
    });

    it('should display the modal with facets in collapsed mode', () => {
      const allFacets = [
        facetComponent,
        numericFacetComponent,
        categoryFacetComponent,
        ratingFacetComponent,
        colorFacetComponent,
        timeframeFacetComponent,
        ratingRangeFacetComponent,
      ];
      RefineModalSelectors.facets()
        .should('be.visible')
        .children()
        .should('have.length', allFacets.length);

      RefineModalSelectors.facets()
        .children<HTMLAtomicFacetElement>()
        .map(([facet]) => facet.isCollapsed)
        .should(
          'deep.eq',
          Array.from({length: allFacets.length}, () => true)
        );
    });

    it('should close when clicking close button', () => {
      RefineModalSelectors.closeButton().click();
      cy.get('body').should('not.have.class', 'atomic-modal-opened');
      RefineModalSelectors.facets().should('not.exist');
    });

    it('should close when clicking footer button', () => {
      RefineModalSelectors.footerButton().click();
      cy.get('body').should('not.have.class', 'atomic-modal-opened');
      RefineModalSelectors.facets().should('not.exist');
    });

    it('should have a focus trap', () => {
      RefineModalSelectors.focusTrap().should('exist');

      cy.get(`${facetManagerComponent}[aria-hidden="true"]`).should('exist');
    });
  });

  describe('when the modal is opened with collapseFacetsAfter=2', () => {
    const collapseFacetsAfter = 2;
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggle({'collapse-facets-after': collapseFacetsAfter}))
        .withMobileViewport()
        .init();
      RefineToggleSelectors.buttonOpen().click();
    });

    it('should display the modal with all but the first 2 facets in collapsed mode', () => {
      const allFacets = [
        facetComponent,
        numericFacetComponent,
        categoryFacetComponent,
        ratingFacetComponent,
        colorFacetComponent,
        timeframeFacetComponent,
        ratingRangeFacetComponent,
      ];
      RefineModalSelectors.facets()
        .should('be.visible')
        .children()
        .should('have.length', allFacets.length);

      RefineModalSelectors.facets()
        .children<HTMLAtomicFacetElement>()
        .map(([facet]) => facet.isCollapsed)
        .should(
          'deep.eq',
          Array.from(
            {length: allFacets.length},
            (_, i) => i >= collapseFacetsAfter
          )
        );
    });
  });

  describe('when the modal is opened with range facet variations', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggleRangeVariations())
        .withMobileViewport()
        .init();
      RefineToggleSelectors.buttonOpen().click();
    });

    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);

    it('should display the modal with the proper range facets', () => {
      RefineModalSelectors.facets()
        .find(timeframeFacetComponent)
        .should('have.length', 3);

      RefineModalSelectors.facets()
        .find(numericFacetComponent)
        .should('have.length', 3);
    });
  });
});
