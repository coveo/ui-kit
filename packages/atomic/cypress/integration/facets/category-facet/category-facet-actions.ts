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
export const categoryFacetLabel = 'Atlas';

export interface CategoryFacetSetupOptions {
  field: string;
  attributes: string;
  withResultList: boolean;
}

export const addCategoryFacet =
  (props: TagProps = {}, withResultList = false) =>
  (env: TestFixture) => {
    addTag(env, 'atomic-breadcrumb-manager', {});
    addTag(env, 'atomic-category-facet', {
      field: hierarchicalField,
      label: 'Atlas',
      'number-of-values': defaultNumberOfValues,
      ...props,
    });
    withResultList && addTag(env, 'atomic-result-list', {});
  };

export function selectChildValueAt(index: number) {
  CategoryFacetSelectors.childValue()
    .find('[part="value-label"]')
    .eq(index)
    .then(([childValue]) => {
      const text = childValue.textContent!;
      cy.wrap(childValue).click();
      CategoryFacetSelectors.activeParentValueWithText(text).should('exist');
    });
}

export function selectSearchResultAt(index: number) {
  CategoryFacetSelectors.searchResult()
    .find('[part="value-label"]')
    .eq(index)
    .then(([searchResult]) => {
      const text = searchResult.textContent!;
      cy.wrap(searchResult).click();
      CategoryFacetSelectors.activeParentValueWithText(text).should('exist');
    });
}

export function pressParentButton(index: number) {
  CategoryFacetSelectors.parentValue()
    .eq(index)
    .then(([parentValue]) => {
      const text = parentValue.textContent!;
      cy.wrap(parentValue).click();
      CategoryFacetSelectors.activeParentValueWithText(text).should('exist');
    });
}

export function pressClearButton() {
  CategoryFacetSelectors.clearButton().click();
  CategoryFacetSelectors.clearButton().should('not.exist');
}

export function pressAllCategoriesButton() {
  CategoryFacetSelectors.allCategoriesButton().click();
  CategoryFacetSelectors.allCategoriesButton().should('not.exist');
}

export function pressActiveParent() {
  CategoryFacetSelectors.activeParentValue().click();
  CategoryFacetSelectors.activeParentValue().should('not.exist');
}

export function pressShowMore() {
  CategoryFacetSelectors.childValue()
    .its('length')
    .then((childValueCount) => {
      CategoryFacetSelectors.showMoreButton().click();
      CategoryFacetSelectors.childValue().should(
        'have.length.greaterThan',
        childValueCount
      );
    });
}

export function pressShowLess() {
  CategoryFacetSelectors.childValue()
    .its('length')
    .then((childValueCount) => {
      CategoryFacetSelectors.showLessButton().click();
      CategoryFacetSelectors.childValue().should(
        'have.length.lessThan',
        childValueCount
      );
    });
}
