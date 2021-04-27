import {setUpPage} from '../../../utils/setupComponent';
import {CategoryFacetSelectors} from './category-facet-selectors';

export const canadaHierarchy = [
  'North America',
  'Canada',
  'Quebec',
  'Montreal',
];
export const canadaHierarchyIndex = [0, 1, 0, 4];
export const togoHierarchy = ['Africa', 'Togo', 'Lome'];
export const hierarchicalField = 'geographicalhierarchy';
export const defaultNumberOfValues = 5;

export interface CategoryFacetSetupOptions {
  field: string;
  attributes: string;
  executeFirstSearch: boolean;
  withResultList: boolean;
}

// TODO: adapt to new setup
export function setupCategoryFacet(
  options: Partial<CategoryFacetSetupOptions> = {}
) {
  const setupOptions: CategoryFacetSetupOptions = {
    attributes: '',
    executeFirstSearch: true,
    field: hierarchicalField,
    withResultList: false,
    ...options,
  };
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>     
      <atomic-category-facet field="${setupOptions.field}" label="Atlas" ${
      setupOptions.attributes
    }></atomic-category-facet>
      ${
        setupOptions.withResultList &&
        '<atomic-result-list></atomic-result-list>'
      }`,
    setupOptions.executeFirstSearch
  );
}

export function selectChildValueAt(index: number) {
  CategoryFacetSelectors.childValue().eq(index).click();
}
