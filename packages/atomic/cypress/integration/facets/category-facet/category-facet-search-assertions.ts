import {RouteAlias} from '../../../utils/setupComponent';
import {hierarchicalField} from './category-facet-actions';
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

export function assertDisplaySearchResults(display: boolean) {
  it(`${should(display)} display a the facet search results`, () => {
    CategoryFacetSearchSelectors.searchResults().should(
      display ? 'be.visible' : 'not.be.visible'
    );
  });
}

export function assertDisplayNoValuesFound(display: boolean) {
  it(`${should(display)} display the "No values found." label`, () => {
    CategoryFacetSearchSelectors.searchNoResults().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertNumberOfSearchResults(value: number) {
  it(`should display ${value} facet search results`, () => {
    if (value > 0) {
      CategoryFacetSearchSelectors.searchResultButton()
        .its('length')
        .should('eq', value);
      return;
    }

    CategoryFacetSearchSelectors.searchResultButton().should('not.exist');
  });
}

export function assertSearchResultLabelAt(label: string, index: number) {
  it(`should display the label ${label} for the facet search result at index ${index}`, () => {
    CategoryFacetSearchSelectors.searchResultValueLabel()
      .eq(index)
      .contains(label);
  });
}

export function assertActiveResult(resultValue: string) {
  it(`the result with the value ${resultValue} should be selected`, () => {
    CategoryFacetSearchSelectors.activeSearchResult().contains(resultValue);
  });
}

export function assertSearchResultLabelHighlightAt(
  highlight: string,
  index: number
) {
  it(`should highlight the string ${highlight} for the facet search result at index ${index}`, () => {
    CategoryFacetSearchSelectors.searchResultValueLabelHighlight()
      .eq(index)
      .should('have.text', highlight);
  });
}

export function assertSearchResultCountAt(count: number, index: number) {
  it(`should display the count ${count} for the facet search result at index ${index}`, () => {
    CategoryFacetSearchSelectors.searchResultValueCount()
      .eq(index)
      .contains(count.toLocaleString('en'));
  });
}

export function assertSearchResultPathAt(path: string[], index: number) {
  const joinedPath = path.join(); // TODO: improve!
  it(`should display the path ${joinedPath} for the facet search result at index ${index}`, () => {
    CategoryFacetSearchSelectors.searchResultPath()
      .eq(index)
      .contains(joinedPath);
  });
}

export function assertInputEmpty() {
  it('should clear the input value', () => {
    CategoryFacetSearchSelectors.searchInput().should('have.value', '');
  });
}

export function assertLogFacetSearch() {
  it('should log the facet search to UA', () => {
    cy.wait(RouteAlias.analytics).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertSearchCleared() {
  assertInputEmpty();
  assertDisplaySearchResults(false);
}
