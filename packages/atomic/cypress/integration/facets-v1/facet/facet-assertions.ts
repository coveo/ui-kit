import {TestFixture} from '../../../fixtures/test-fixture';
import {
  doSortAlphanumeric,
  doSortOccurences,
} from '../../../utils/componentUtils';
import {should} from '../../common-assertions';
import {FacetSelectors} from './facet-selectors';

export function assertNumberOfSelectedBoxValues(value: number) {
  it(`should display ${value} number of selected box values`, () => {
    if (value > 0) {
      FacetSelectors.selectedBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.selectedBoxValue().should('not.exist');
  });
}

export function assertNumberOfIdleBoxValues(value: number) {
  it(`should display ${value} number of idle box values`, () => {
    if (value > 0) {
      FacetSelectors.idleBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.idleBoxValue().should('not.exist');
  });
}

export function assertDisplayShowMoreButton(display: boolean) {
  it(`${should(display)} display a "Show more" button`, () => {
    FacetSelectors.showMoreButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowLessButton(display: boolean) {
  it(`${should(display)} display a "Show less" button`, () => {
    FacetSelectors.showLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplaySearchInput(display: boolean) {
  it(`${should(display)} display the facet search input`, () => {
    FacetSelectors.searchInput().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplaySearchClearButton(display: boolean) {
  it(`${should(display)} display the facet search clear button`, () => {
    FacetSelectors.searchClearButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertHighlightsResults(query: string) {
  it(`should highlight the results with the query "${query}"`, () => {
    FacetSelectors.valueHighlight().each((element) => {
      const text = element.text().toLowerCase();
      expect(text).to.eq(query.toLowerCase());
    });
  });
}

export function assertSearchInputEmpty() {
  it('the search input should be empty', () => {
    FacetSelectors.searchInput().invoke('val').should('be.empty');
  });
}

export function assertDisplayMoreMatchesFound(display: boolean) {
  it(`${should(display)} display the "More matches for" label`, () => {
    FacetSelectors.moreMatches().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayNoMatchesFound(display: boolean) {
  it(`${should(display)} display the "No matches found for" label`, () => {
    FacetSelectors.noMatches().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertMoreMatchesFoundContainsQuery(query: string) {
  it(`"More matches for" label should have the query ${query}`, () => {
    FacetSelectors.moreMatches().contains(query);
  });
}

export function assertNoMatchesFoundContainsQuery(query: string) {
  it(`"No matches found for" label should have the query ${query}`, () => {
    FacetSelectors.noMatches().contains(query);
  });
}

export function assertLogFacetSelect(field: string, index: number) {
  it('should log the facet select results to UA ', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      FacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    FacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
    });
  });
}

export function assertValuesSortedByOccurences() {
  it('values should be ordered by occurences', () => {
    FacetSelectors.valueCount().as('facetAllValuesCount');
    cy.getTextOfAllElements('@facetAllValuesCount').then((originalValues) => {
      expect(originalValues).to.eql(doSortOccurences(originalValues));
    });
  });
}

export function assertLogFacetShowMore(field: string) {
  it('should log the facet show more results to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertLogFacetShowLess(field: string) {
  it('should log the facet show less results to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('eventType', 'facet');
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertLogFacetSearch(field: string) {
  it('should log the facet search to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSearch');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}
