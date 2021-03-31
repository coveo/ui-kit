import {injectComponent, setUpPage} from '../utils/setupComponent';

describe('Breadcrumb Manager Test Suites', () => {
  const tag = 'atomic-breadcrumb-manager';
  const component = (attributes = '') => `<${tag} ${attributes}></${tag}>`;
  const wait = 1000;

  describe('Default properties test', () => {
    it.skip('should initially show not breadcrumbs');
    it.skip('should display one breadcrumb when a regular facet is selected.');
    it.skip('should hide the breadcrumb when delelected in the facet');
    it.skip('should hide the breadcrumb when it is clicked');
    it.skip('should display multiple fields from a regular and category facet');
    it.skip('should hide all breadcrumbs on clicking "Clear All Filters"');
    it.skip('should hide 2 fields when 7 are slected');
    it.skip('should display all fields on clicking "Show More"');
    it.skip('should use "/" as separator for category-facet subcategories');
  });

  const customized_component = (
    attributes = 'collapse-threshold=4 category-divider=";"'
  ) => `<${tag} ${attributes}></${tag}>`;

  describe('Custom properties test ()', () => {
    it.skip('should hide 3 fields when 7 are slected');
    it.skip('should use ";" as separator for category-facet subcategories');
  });
});
