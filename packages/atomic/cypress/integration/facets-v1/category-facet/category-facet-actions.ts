import {addTag, TagProps, TestFixture} from '../../../fixtures/test-fixture';
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
  withResultList: boolean;
}

export const addCategoryFacet =
  (props: TagProps = {}, withResultList = false) =>
  (env: TestFixture) => {
    addTag(env, 'atomic-breadcrumb-manager', {});
    addTag(env, 'atomic-category-facet-v1', {
      field: hierarchicalField,
      label: 'Atlas',
      'number-of-values': defaultNumberOfValues,
      ...props,
    });
    withResultList && addTag(env, 'atomic-result-list', {});
  };

export function selectChildValueAt(index: number) {
  CategoryFacetSelectors.childValue().eq(index).click();
}

export function selectSearchResultAt(index: number) {
  CategoryFacetSelectors.searchResult().eq(index).click();
}
