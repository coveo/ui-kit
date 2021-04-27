import {CategoryFacetSearchSelectors} from './category-facet-search-selectors';

function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertDisplaySearch(display: boolean) {
  it(`${should(display)} display a the facet search`, () => {
    CategoryFacetSearchSelectors.searchInput().should(
      display ? 'be.visible' : 'not.exist'
    );
    CategoryFacetSearchSelectors.searchResults().should(
      display ? 'exist' : 'not.exist'
    );
  });
}
