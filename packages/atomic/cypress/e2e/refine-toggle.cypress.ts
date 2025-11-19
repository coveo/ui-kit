import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {automaticFacetGeneratorComponent} from './facets/automatic-facet-generator/automatic-facet-generator-assertions';
import {hierarchicalField} from './facets/category-facet/category-facet-actions';
import {categoryFacetComponent} from './facets/category-facet/category-facet-selectors';
import {colorFacetField} from './facets/color-facet/color-facet-actions';
import {colorFacetComponent} from './facets/color-facet/color-facet-selectors';
import {field as facetField} from './facets/facet/facet-actions';
import {facetComponent} from './facets/facet/facet-selectors';
import {numericFacetField} from './facets/numeric-facet/numeric-facet-actions';
import {numericFacetComponent} from './facets/numeric-facet/numeric-facet-selectors';
import {ratingFacetField} from './facets/rating-facet/rating-facet-actions';
import {ratingFacetComponent} from './facets/rating-facet/rating-facet-selectors';
import {ratingRangeFacetField} from './facets/rating-range-facet/rating-range-facet-actions';
import {ratingRangeFacetComponent} from './facets/rating-range-facet/rating-range-facet-selectors';
import {timeframeFacetField} from './facets/timeframe-facet/timeframe-facet-action';
import {timeframeFacetComponent} from './facets/timeframe-facet/timeframe-facet-selectors';
import {
  addFacetManagerWithBothTypesOfFacets,
  addRefineToggleRangeVariations,
  addRefineToggleWithAutomaticFacets,
  addRefineToggleWithDependsOnFacetAndNumerical,
  addRefineToggleWithStaticFacets,
  addRefineToggleWithStaticFacetsAndNoManager,
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

  describe('when the modal is opened with static facets and no facet manager', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggleWithStaticFacetsAndNoManager())
        .withMobileViewport()
        .init();
      cy.wait(1000);
      RefineToggleSelectors.buttonOpen().click();
    });

    it('should display the facets in the correct order', () => {
      const expectedFacetOrder = [
        facetField,
        numericFacetField,
        hierarchicalField,
        ratingFacetField,
        ratingRangeFacetField,
        colorFacetField,
        timeframeFacetField,
      ];

      RefineModalSelectors.facets()
        .children()
        .each(($facet, index) => {
          const expectedFacet = expectedFacetOrder[index];
          cy.wrap($facet).should('have.attr', 'field', expectedFacet);
        });
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

    it('should render the modal', () => {
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertConsoleErrorWithoutIt(false);
      CommonAssertions.assertAccessibilityWithoutIt(refineModalComponent);
      CommonAssertions.assertWCAG2_5_3();
    });

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

    it('should render the modal', () => {
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertAccessibilityWithoutIt(refineModalComponent);
      CommonAssertions.assertWCAG2_5_3();
    });

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

    it('should render the modal', () => {
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertAccessibilityWithoutIt(refineModalComponent);
      CommonAssertions.assertWCAG2_5_3();
    });

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
    const staticFacetAmount = 1;
    const automaticFacetAmount = 1;
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

    it('should render the modal', () => {
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertAccessibilityWithoutIt(refineModalComponent);
      CommonAssertions.assertWCAG2_5_3();
    });

    it('should display the filter section', () => {
      RefineModalSelectors.filterSection().should('exist');
    });

    it('should display the automatic facets', () => {
      RefineModalSelectors.automaticFacets().should('exist');
    });

    it('should display both facet types', () => {
      RefineModalSelectors.automaticFacets()
        .children()
        .should('have.length', automaticFacetAmount);

      const allStaticFacet = [facetComponent];
      RefineModalSelectors.facets()
        .children()
        .should('have.length', allStaticFacet.length + 1);
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

    it('should render the modal', () => {
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertContainsComponentErrorWithoutIt(
        RefineModalSelectors,
        false
      );
      CommonAssertions.assertConsoleErrorWithoutIt(false);
    });

    it('should display the modal with the proper range facets', () => {
      RefineModalSelectors.facets()
        .find(timeframeFacetComponent)
        .should('have.length', 3);
      RefineModalSelectors.facets()
        .find(numericFacetComponent)
        .should('have.length', 3);
    });
  });

  describe('when the modal is opened with a `depends-on` facet', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addRefineToggleWithDependsOnFacetAndNumerical())
        .withMobileViewport()
        .init();
      cy.wait(1000);
      RefineToggleSelectors.buttonOpen().should('be.visible').click();
    });

    it('should render each facets only once', () => {
      RefineModalSelectors.facets().children().should('have.length', 3);
    });
  });
});
