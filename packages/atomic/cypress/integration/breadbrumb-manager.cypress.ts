import {setUpPage} from '../utils/setupComponent';
import {FacetAlias} from './facets/facet-selectors';
import {
  BreadcrumbSelectors,
  createAliasLi,
} from './breadcrumb-manager-selectors';

describe('Breadcrumb Manager Test Suites', () => {
  function setupComponents(attributes: string) {
    setUpPage(`
    <atomic-breadcrumb-manager ${attributes}></atomic-breadcrumb-manager>
    <atomic-facet field="author" label="Author"></atomic-facet>
    <atomic-category-facet field="geographicalhierarchy" label="World Atlas"></atomic-category-facet>`);
  }

  describe('Default properties test', () => {
    beforeEach(() => {
      setupComponents('');
      createAliasLi();
    });
    it.skip('should initially not display any breadcrumbs');

    it('should display one breadcrumb when a regular facet is selected.', () => {
      console.log(cy.get(FacetAlias.facetFirstValueLabel));
      cy.get(FacetAlias.facetFirstValueLabel).click();
      cy.get('@breadcrumbLi').should('be.visible');
    });

    it.skip('should hide the breadcrumb when delelected in the facet');
    it.skip('should hide the breadcrumb when it is clicked');
    it.skip('should display multiple fields from a regular and category facet');
    it.skip('should hide all breadcrumbs on clicking "Clear All Filters"');
    it.skip('should hide 2 fields when 7 are slected');
    it.skip('should display all fields on clicking "Show More"');
    it.skip('should use "/" as separator for category-facet subcategories');
  });

  describe('Custom properties test ()', () => {
    beforeEach(() => {
      setupComponents('collapse-threshold=4 category-divider=";"');
    });
    it.skip('should hide 3 fields when 7 are slected');
    it.skip('should use ";" as separator for category-facet subcategories');
  });
});
