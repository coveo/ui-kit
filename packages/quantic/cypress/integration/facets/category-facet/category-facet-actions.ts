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

function categoryFacetActions(selector: CategoryFacetSelector) {
  return {
    selectChildValue(value: string) {
      selector.childValueOption().contains(value).click({force: true});
    },
    selectParentValue(value: string) {
      selector.parentValueOption().contains(value).click({force: true});
    },
    clickShowMoreButton() {
      selector.showMoreButton().click();
    },
    clickShowLessButton() {
      selector.showLessButton().click();
    },
    clickAllCategories() {
      selector.allCategories().click();
    },
    typeFacetSearchQuery(value: string) {
      selector.searchInput().type(value);
    },
    selectSearchResult(value: string) {
      selector.searchResults().contains(value).click({force: true});
    },
  };
}

export const CategoryFacetActions = {
  ...categoryFacetActions(CategoryFacetSelectors),
};
