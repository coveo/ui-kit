import {
  CategoryFacetSelector,
  CategoryFacetSelectors,
} from './category-facet-selectors';

export const canadaHierarchy = [
  'North America',
  'Canada',
  'Quebec',
  'Montreal',
];
export const canadaHierarchyIndex = [0, 1, 0, 4];

function categoryFacetActions(selector: CategoryFacetSelector) {
  return {
    selectChildValueAt(index: number) {
      selector.childValueOption().eq(index).click({force: true});
    },
    clickShowMoreButton() {
      selector.showMoreButton().click();
    },
    clickShowLessButton() {
      selector.showLessButton().click();
    },
  };
}

export const CategoryFacetActions = {
  ...categoryFacetActions(CategoryFacetSelectors),
};
