import {
  AllFacetSelectors,
  CategoryFacetSelectors,
} from './category-facet-selectors';

export const montrealHierarchy = [
  'North America',
  'Canada',
  'Quebec',
  'Montreal',
];
export const togoHierarchy = ['Africa', 'Togo', 'Lome'];

function categoryFacetActions(selector: AllFacetSelectors) {
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
    clickSearchClearButton() {
      selector.searchClearButton().click();
    },
  };
}

export const CategoryFacetActions = {
  ...categoryFacetActions(CategoryFacetSelectors),
};
