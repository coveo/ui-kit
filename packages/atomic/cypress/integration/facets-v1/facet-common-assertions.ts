import {TestFixture} from '../../fixtures/test-fixture';
import {ComponentSelector, should} from '../common-assertions';

export interface BaseFacetSelector extends ComponentSelector {
  wrapper: () => Cypress.Chainable<JQuery<HTMLElement>>;
  labelButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  values: () => Cypress.Chainable<JQuery<HTMLElement>>;
  clearButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  placeholder: () => Cypress.Chainable<JQuery<HTMLElement>>;
  valueLabel: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetWithCheckboxSelector extends ComponentSelector {
  selectedCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  idleCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetWithLinkSelector extends ComponentSelector {
  selectedLinkValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  idleLinkValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetWithSearchSelector extends ComponentSelector {
  searchInput: () => Cypress.Chainable<JQuery<HTMLElement>>;
  searchClearButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  moreMatches: () => Cypress.Chainable<JQuery<HTMLElement>>;
  noMatches: () => Cypress.Chainable<JQuery<HTMLElement>>;
  valueHighlight: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetWithShowMoreLessSelector extends ComponentSelector {
  showLessButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  showMoreButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function assertLabelContains(
  BaseFacetSelector: BaseFacetSelector,
  label: string
) {
  it(`should have the label "${label}"`, () => {
    BaseFacetSelector.labelButton().contains(label);
  });
}

export function assertDisplayFacet(
  BaseFacetSelector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display the numeric facet`, () => {
    BaseFacetSelector.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayValues(
  BaseFacetSelector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display facet values`, () => {
    BaseFacetSelector.values().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertNumberOfSelectedCheckboxValues(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  value: number
) {
  it(`should display ${value} number of selected checkbox values`, () => {
    if (value > 0) {
      FacetWithCheckboxSelector.selectedCheckboxValue()
        .its('length')
        .should('eq', value);
      return;
    }

    FacetWithCheckboxSelector.selectedCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfIdleCheckboxValues(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  value: number
) {
  it(`should display ${value} number of idle checkbox values`, () => {
    if (value > 0) {
      FacetWithCheckboxSelector.idleCheckboxValue()
        .its('length')
        .should('eq', value);
      return;
    }

    FacetWithCheckboxSelector.idleCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfSelectedLinkValues(
  FacetWithLinkSelector: FacetWithLinkSelector,
  value: number
) {
  it(`should display ${value} number of selected link values`, () => {
    if (value > 0) {
      FacetWithLinkSelector.selectedLinkValue()
        .its('length')
        .should('eq', value);
      return;
    }

    FacetWithLinkSelector.selectedLinkValue().should('not.exist');
  });
}
export function assertNumberOfIdleLinkValues(
  FacetWithLinkSelector: FacetWithLinkSelector,
  value: number
) {
  it(`should display ${value} number of idle link values`, () => {
    if (value > 0) {
      FacetWithLinkSelector.idleLinkValue().its('length').should('eq', value);
      return;
    }

    FacetWithLinkSelector.idleLinkValue().should('not.exist');
  });
}

export function assertDisplayClearButton(
  BaseFacetSelector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display a "Clear filter" button`, () => {
    BaseFacetSelector.clearButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertLogClearFacetValues(field: string) {
  it('should log the facet clear all to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetClearAll');
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertDisplayPlaceholder(
  BaseFacetSelector: BaseFacetSelector,
  display: boolean
) {
  it(`${should(display)} display the placeholder`, () => {
    BaseFacetSelector.placeholder().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertFirstValueContains(
  BaseFacetSelector: BaseFacetSelector,
  value: string
) {
  it(`first child value should contain ${value}`, () => {
    BaseFacetSelector.valueLabel().first().contains(value);
  });
}

export function assertDisplaySearchInput(
  FacetWithSearchSelector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the facet search input`, () => {
    FacetWithSearchSelector.searchInput().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplaySearchClearButton(
  FacetWithSearchSelector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the facet search clear button`, () => {
    FacetWithSearchSelector.searchClearButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertHighlightsResults(
  FacetWithSearchSelector: FacetWithSearchSelector,
  query: string
) {
  it(`should highlight the results with the query "${query}"`, () => {
    FacetWithSearchSelector.valueHighlight().each((element) => {
      const text = element.text().toLowerCase();
      expect(text).to.eq(query.toLowerCase());
    });
  });
}

export function assertSearchInputEmpty(
  FacetWithSearchSelector: FacetWithSearchSelector
) {
  it('the search input should be empty', () => {
    FacetWithSearchSelector.searchInput().invoke('val').should('be.empty');
  });
}

export function assertDisplayMoreMatchesFound(
  FacetWithSearchSelector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the "More matches for" label`, () => {
    FacetWithSearchSelector.moreMatches().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayNoMatchesFound(
  FacetWithSearchSelector: FacetWithSearchSelector,
  display: boolean
) {
  it(`${should(display)} display the "No matches found for" label`, () => {
    FacetWithSearchSelector.noMatches().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertMoreMatchesFoundContainsQuery(
  FacetWithSearchSelector: FacetWithSearchSelector,
  query: string
) {
  it(`"More matches for" label should have the query ${query}`, () => {
    FacetWithSearchSelector.moreMatches().contains(query);
  });
}

export function assertNoMatchesFoundContainsQuery(
  FacetWithSearchSelector: FacetWithSearchSelector,
  query: string
) {
  it(`"No matches found for" label should have the query ${query}`, () => {
    FacetWithSearchSelector.noMatches().contains(query);
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

export function assertDisplayShowMoreButton(
  FacetWithShowMoreLessSelector: FacetWithShowMoreLessSelector,
  display: boolean,
  exist = true
) {
  it(`${should(display)} display a "Show more" button`, () => {
    FacetWithShowMoreLessSelector.showMoreButton().should(
      display ? 'be.visible' : exist ? 'not.be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayShowLessButton(
  FacetWithShowMoreLessSelector: FacetWithShowMoreLessSelector,
  display: boolean,
  exist = true
) {
  it(`${should(display)} display a "Show less" button`, () => {
    FacetWithShowMoreLessSelector.showLessButton().should(
      display ? 'be.visible' : exist ? 'not.be.visible' : 'not.exist'
    );
  });
}
