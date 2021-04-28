import {setUpPage} from '../utils/setupComponent';
import {
  facetValueShouldDisplayInBreadcrumb,
  clickOnCategoryFacetWithValue,
  clickOnNthCategoryFacet,
  clickOnNthFacet,
} from './facets/facet-utils';
import {
  createBreadcrumbShadowAlias,
  BreadcrumbAlias,
  FacetSelectors,
  FacetAlias,
  createAliasFacetUL,
  createAliasShadow,
} from './facets/facet-selectors';

const numericFacetProp = {
  field: 'size',
  label: 'File sizes',
};

const categoryFacetProp = {
  field: 'geographicalhierarchy',
  label: 'Atlas',
};

describe('Breadcrumb Manager Test Suites', () => {
  function setupComponents(attributes: string) {
    setUpPage(`
      <atomic-breadcrumb-manager ${attributes}></atomic-breadcrumb-manager>
      <atomic-numeric-facet 
        field="${numericFacetProp.field}" 
        label="${numericFacetProp.label}"
      ></atomic-numeric-facet>
      <atomic-category-facet 
        field="${categoryFacetProp.field}" 
        label="${categoryFacetProp.label}"
      ></atomic-category-facet>`);
  }

  describe('Default properties test', () => {
    beforeEach(() => {
      setupComponents('');
      createAliasFacetUL(numericFacetProp.field, FacetSelectors.numericFacet);
    });

    it('should display one breadcrumb when a regular facet is selected.', () => {
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      createBreadcrumbShadowAlias();
      facetValueShouldDisplayInBreadcrumb(FacetAlias.facetFirstValue, 1);
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 1);
    });

    it('should remove the breadcrumb when deselected in the facet', () => {
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      createBreadcrumbShadowAlias();
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 0);
    });

    it('should remove the breadcrumb when it is clicked', () => {
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs).first().click();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 0);
    });

    it('should display multiple fields from a regular and category facet', () => {
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      cy.get(FacetAlias.facetSecondValue).find(FacetSelectors.label).click();
      createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
      createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
      clickOnNthCategoryFacet(0);
      // cy.pause();
      // createBreadcrumbShadowAlias();
      // cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 3);
    });

    it('should remove all breadcrumbs on clicking "Clear All Filters"', () => {
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbClearAllFilter).should('be.visible');
      cy.get(BreadcrumbAlias.breadcrumbClearAllFilter).click();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 0);
    });

    it('should hide 2 fields when 7 are slected', () => {
      for (let n = 0; n < 7; n++) {
        clickOnNthFacet(n);
        cy.wait(100);
      }
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 5);
    });

    it('should display all fields on clicking "Show More"', () => {
      for (let n = 0; n < 7; n++) {
        clickOnNthFacet(n);
        cy.wait(150);
      }
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.showMoreButton).click();
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 7);
    });

    it('should use "/" as separator for category facet subcategories', () => {
      // createBreadcrumbShadowAlias() expects at least one regular facet breadcrumb:
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();

      createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
      createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
      clickOnCategoryFacetWithValue('Africa');
      clickOnCategoryFacetWithValue('Angola');
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs)
        .last()
        .find('span')
        .should('have.text', 'Africa / Angola');
    });
  });

  describe('Custom properties test ()', () => {
    beforeEach(() => {
      setupComponents('collapse-threshold=4 category-divider=";"');
      createAliasFacetUL(numericFacetProp.field, FacetSelectors.numericFacet);
    });

    it('should hide 3 fields when 7 are selected', () => {
      for (let n = 0; n < 7; n++) {
        clickOnNthFacet(n);
        cy.wait(150);
      }
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs).should('have.length', 4);
    });

    it('should use ";" as a custom separator for category facet subcategories', () => {
      // createBreadcrumbShadowAlias() expects at least one regular facet breadcrumb:
      cy.get(FacetAlias.facetFirstValue).find(FacetSelectors.label).click();

      createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
      createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
      clickOnCategoryFacetWithValue('Africa');
      clickOnCategoryFacetWithValue('Angola');
      createBreadcrumbShadowAlias();
      cy.get(BreadcrumbAlias.breadcrumbs)
        .last()
        .find('span')
        .should('have.text', 'Africa ; Angola');
    });
  });
});
