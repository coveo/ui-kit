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
