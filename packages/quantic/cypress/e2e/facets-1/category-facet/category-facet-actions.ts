import {
  facetWithSearchActions,
  facetWithShowMoreLessActions,
} from '../facet-common-actions';
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
      selector
        .childValueOption()
        .contains(value)
        .click({force: true})
        .logAction(`when selecting "${value}"`);
    },
    selectParentValue(value: string) {
      selector.parentValueOption().contains(value).click({force: true});
    },
    clickAllCategories() {
      selector.allCategories().click();
    },
    selectSearchResult(value: string) {
      selector.searchResults().contains(value).click({force: true});
    },
  };
}

export const CategoryFacetActions = {
  ...categoryFacetActions(CategoryFacetSelectors),
  ...facetWithShowMoreLessActions(CategoryFacetSelectors),
  ...facetWithSearchActions(CategoryFacetSelectors),
};
