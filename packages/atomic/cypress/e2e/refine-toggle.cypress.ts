import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {automaticFacetGeneratorComponent} from './facets/automatic-facet-generator/automatic-facet-generator-assertions';
import {categoryFacetComponent} from './facets/category-facet/category-facet-selectors';
import {colorFacetComponent} from './facets/color-facet/color-facet-selectors';
import {facetComponent} from './facets/facet/facet-selectors';
import {facetManagerComponent} from './facets/manager/facet-manager-actions';
import {numericFacetComponent} from './facets/numeric-facet/numeric-facet-selectors';
import {ratingFacetComponent} from './facets/rating-facet/rating-facet-selectors';
import {ratingRangeFacetComponent} from './facets/rating-range-facet/rating-range-facet-selectors';
import {timeframeFacetComponent} from './facets/timeframe-facet/timeframe-facet-selectors';
import {
  addFacetManagerWithBothTypesOfFacets,
  addRefineToggleRangeVariations,
  addRefineToggleWithAutomaticFacets,
  addRefineToggleWithStaticFacets,
  addRefineToggleWithoutFacets,
} from './refine-toggle-actions';
import {
  refineModalComponent,
  RefineModalSelectors,
  RefineToggleSelectors,
} from './refine-toggle-selectors';

describe('Refine Toggle Test Suites', () => {
  describe('when the modal is closed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggleWithStaticFacets())
        .withMobileViewport()
        .init();
    });
    CommonAssertions.assertContainsComponentError(RefineToggleSelectors, false);
    CommonAssertions.assertConsoleError(false);

    it('should display a button', () => {
      RefineToggleSelectors.buttonOpen()
        .should('be.visible')
        .should('have.text', 'Sort & Filter');
    });
  });

  describe('when the modal is opened with no facets', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggleWithoutFacets())
        .withMobileViewport()
        .init();
      RefineToggleSelectors.buttonOpen().click();
    });
    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility(refineModalComponent);

    it('should not display the filter section', () => {
      RefineModalSelectors.filterSection().should('not.exist');
    });
  });

  describe('when the modal is opened with static facets', () => {
    const collapseFacetsAfter = 2;
    beforeEach(() => {
      new TestFixture()
        .with(
          addRefineToggleWithStaticFacets({
            'collapse-facets-after': collapseFacetsAfter,
          })
        )
        .withMobileViewport()
        .init();
      cy.wait(1000);
      RefineToggleSelectors.buttonOpen().click();
    });
    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility(refineModalComponent);

    it('should modify body className', () => {
      cy.get('body').should('have.class', 'atomic-modal-opened');
    });

    it('should display the facets', () => {
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
        .children()
        .should('have.length', allFacets.length);
    });

    it('should close when clicking close button', () => {
      RefineModalSelectors.closeButton().click();
      cy.get('body').should('not.have.class', 'atomic-modal-opened');
      RefineModalSelectors.facets().should('not.exist');
    });

    it('should close when the escape key is used', () => {
      cy.get('body').type('{esc}', {force: true});
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

    it('should respect the collapseFacetsAfter prop', () => {
      RefineModalSelectors.facets()
        .children()
        .each(($child, index) => {
          if (index + 1 > collapseFacetsAfter) {
            cy.wrap($child).should('have.attr', 'is-collapsed');
            return;
          }
          cy.wrap($child).should('not.have.attr', 'is-collapsed');
        });
    });
  });

  describe('when the modal is opened with automatic facets only', () => {
    const collapseFacetsAfter = 2;
    beforeEach(() => {
      new TestFixture()
        .with(
          addRefineToggleWithAutomaticFacets({
            'collapse-facets-after': collapseFacetsAfter,
          })
        )
        .withMobileViewport()
        .init();
      RefineToggleSelectors.buttonOpen().click();
    });
    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility(refineModalComponent);

    it('should display the filter section', () => {
      RefineModalSelectors.filterSection().should('exist');
    });

    it('should display the automatic facets', () => {
      const automaticFacetAmount = 3;
      RefineModalSelectors.automaticFacets()
        .children()
        .should('have.length', automaticFacetAmount);
    });

    it('should respect the collapseFacetsAfter prop', () => {
      RefineModalSelectors.facets()
        .find(automaticFacetGeneratorComponent)
        .children()
        .each(($child, index) => {
          if (index + 1 > collapseFacetsAfter) {
            cy.wrap($child).should('have.attr', 'is-collapsed');
            return;
          }
          cy.wrap($child).should('not.have.attr', 'is-collapsed');
        });
    });
  });

  describe('when the modal is opened with both facets type', () => {
    const collapseFacetsAfter = 4;
    const staticFacetAmount = 3;
    beforeEach(() => {
      new TestFixture()
        .with(
          addFacetManagerWithBothTypesOfFacets({
            'collapse-facets-after': collapseFacetsAfter,
          })
        )
        .withMobileViewport()
        .init();
      RefineToggleSelectors.buttonOpen().click();
    });
    CommonAssertions.assertContainsComponentError(RefineModalSelectors, false);
    CommonAssertions.assertConsoleError(false);
    CommonAssertions.assertAccessibility(refineModalComponent);

    it('should display the filter section', () => {
      RefineModalSelectors.filterSection().should('exist');
    });

    it('should display the automatic facets', () => {
      RefineModalSelectors.automaticFacets().should('exist');
    });

    it('should display both facet types', () => {
      const automaticFacetAmount = 3;
      RefineModalSelectors.automaticFacets()
        .children()
        .should('have.length', automaticFacetAmount);

      const allFacets = [
        facetComponent,
        numericFacetComponent,
        categoryFacetComponent,
      ];
      RefineModalSelectors.facets()
        .children()
        .should('have.length', allFacets.length + 1);
    });

    it('should respect the collapseFacetsAfter prop', () => {
      RefineModalSelectors.facets()
        .children()
        .each(($child, index) => {
          if (index + 1 > collapseFacetsAfter) {
            cy.wrap($child).should('have.attr', 'is-collapsed');
            return;
          }
          cy.wrap($child).should('not.have.attr', 'is-collapsed');
        });

      RefineModalSelectors.facets()
        .find(automaticFacetGeneratorComponent)
        .children()
        .each(($child, index) => {
          if (index + 1 > collapseFacetsAfter - staticFacetAmount) {
            cy.wrap($child).should('have.attr', 'is-collapsed');
            return;
          }
          cy.wrap($child).should('not.have.attr', 'is-collapsed');
        });
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
