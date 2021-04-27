import {setUpPage} from '../../../utils/setupComponent';
import {
  CategoryFacetSelectors,
  hierarchicalField,
} from './category-facet-selectors';

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
