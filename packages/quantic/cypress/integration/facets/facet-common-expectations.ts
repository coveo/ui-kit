import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from './facet-common-selectors';

export function expectLabelContains(
  selector: BaseFacetSelector,
  label: string
) {
  it(`should have the label "${label}"`, () => {
    selector.label().contains(label);
  });
}

export function expectDisplayValues(
  selector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display facet values`, () => {
    selector.values().should(display ? 'exist' : 'not.exist');
  });
}

export function expectNumberOfSelectedCheckboxValues(
  selector: FacetWithCheckboxSelector,
  value: number
) {
  it(`should display ${value} selected checkbox values`, () => {
    selector.selectedCheckboxValue().should('have.length', value);
  });
}

export function expectNumberOfIdleCheckboxValues(
  selector: FacetWithCheckboxSelector,
  value: number
) {
  it(`should display ${value} idle checkbox values`, () => {
    selector.idleCheckboxValue().should('have.length', value);
  });
}

export function expectDisplayClearButton(
  selector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display a "Clear filter" button`, () => {
    selector.clearButton().should(display ? 'exist' : 'not.exist');
  });
}

export function expectLogClearFacetValues(field: string) {
  it('should log the facet clear all to UA', () => {
    cy.wait(InterceptAliases.UA.Facet.ClearAll).then((interception) => {
      const analyticsBody = interception.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function expectDisplaySearchInput(
  selector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the facet search input`, () => {
    selector.searchInput().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectDisplaySearchClearButton(
  selector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the facet search clear button`, () => {
    selector.searchClearButton().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectHighlightsResults(
  selector: FacetWithSearchSelector,
  query: string
) {
  it(`should highlight the results with the query "${query}"`, () => {
    selector.valueHighlight().each((element) => {
      const text = element.text().toLowerCase();
      expect(text).to.eq(query.toLowerCase());
    });
  });
}

export function expectSearchInputEmpty(selector: FacetWithSearchSelector) {
  it('the search input should be empty', () => {
    selector.searchInput().invoke('val').should('be.empty');
  });
}

export function expectDisplayMoreMatchesFound(
  selector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the "More matches for" label`, () => {
    selector.moreMatches().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectDisplayNoMatchesFound(
  selector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the "No matches found for" label`, () => {
    selector.noMatches().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectMoreMatchesFoundContainsQuery(
  selector: FacetWithSearchSelector,
  query: string
) {
  it(`"More matches for" label should have the query ${query}`, () => {
    selector.moreMatches().contains(query);
  });
}

export function expectNoMatchesFoundContainsQuery(
  selector: FacetWithSearchSelector,
  query: string
) {
  it(`"No matches found for" label should have the query ${query}`, () => {
    selector.noMatches().contains(query);
  });
}

export function expectLogFacetSearch(field: string) {
  it('should log the facet search to UA', () => {
    cy.wait(InterceptAliases.UA.Facet.Search).then((interception) => {
      const analyticsBody = interception.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function expectDisplayShowMoreButton(
  selector: FacetWithShowMoreLessSelector,
  display: boolean
) {
  it(`${should(display)} display a "Show more" button`, () => {
    selector.showMoreButton().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectDisplayShowLessButton(
  selector: FacetWithShowMoreLessSelector,
  display: boolean
) {
  it(`${should(display)} display a "Show less" button`, () => {
    selector.showLessButton().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectDisplayCollapseButton(
  selector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display the collapse button`, () => {
    selector.collapseButton().should(display ? 'be.visible' : 'not.exist');
  });
}

export function expectDisplayExpandButton(
  selector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display the expand button`, () => {
    selector.expandButton().should(display ? 'be.visible' : 'not.exist');
  });
}
