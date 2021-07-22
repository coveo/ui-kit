import {TestFixture} from '../../fixtures/test-fixture';
import {ComponentSelector, should} from '../common-assertions';

export interface FacetsSelector extends ComponentSelector {
  wrapper: () => Cypress.Chainable<JQuery<HTMLElement>>;
  labelButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  values: () => Cypress.Chainable<JQuery<HTMLElement>>;
  selectedCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  idleCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  clearButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  selectedLinkValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  idleLinkValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  placeholder: () => Cypress.Chainable<JQuery<HTMLElement>>;
  valueLabel: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function assertLabelContains(
  FacetsSelector: FacetsSelector,
  label: string
) {
  it(`should have the label "${label}"`, () => {
    FacetsSelector.labelButton().contains(label);
  });
}

export function assertDisplayFacet(
  FacetsSelector: FacetsSelector,
  display: boolean
) {
  it(`${should(display)} display the numeric facet`, () => {
    FacetsSelector.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertDisplayValues(
  FacetsSelector: FacetsSelector,
  display: boolean
) {
  it(`${should(display)} display facet values`, () => {
    FacetsSelector.values().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertNumberOfSelectedCheckboxValues(
  FacetsSelector: FacetsSelector,
  value: number
) {
  it(`should display ${value} number of selected checkbox values`, () => {
    if (value > 0) {
      FacetsSelector.selectedCheckboxValue().its('length').should('eq', value);
      return;
    }

    FacetsSelector.selectedCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfIdleCheckboxValues(
  FacetsSelector: FacetsSelector,
  value: number
) {
  it(`should display ${value} number of idle checkbox values`, () => {
    if (value > 0) {
      FacetsSelector.idleCheckboxValue().its('length').should('eq', value);
      return;
    }

    FacetsSelector.idleCheckboxValue().should('not.exist');
  });
}

export function assertNumberOfSelectedLinkValues(
  FacetsSelector: FacetsSelector,
  value: number
) {
  it(`should display ${value} number of selected link values`, () => {
    if (value > 0) {
      FacetsSelector.selectedLinkValue().its('length').should('eq', value);
      return;
    }

    FacetsSelector.selectedLinkValue().should('not.exist');
  });
}
export function assertNumberOfIdleLinkValues(
  FacetsSelector: FacetsSelector,
  value: number
) {
  it(`should display ${value} number of idle link values`, () => {
    if (value > 0) {
      FacetsSelector.idleLinkValue().its('length').should('eq', value);
      return;
    }

    FacetsSelector.idleLinkValue().should('not.exist');
  });
}

export function assertDisplayClearButton(
  FacetsSelector: FacetsSelector,
  display: boolean
) {
  it(`${should(display)} display a "Clear filter" button`, () => {
    FacetsSelector.clearButton().should(display ? 'be.visible' : 'not.exist');
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
  FacetsSelector: FacetsSelector,
  display: boolean
) {
  it(`${should(display)} display the placeholder`, () => {
    FacetsSelector.placeholder().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertFirstValueContains(
  FacetsSelector: FacetsSelector,
  value: string
) {
  it(`first child value should contain ${value}`, () => {
    FacetsSelector.valueLabel().first().contains(value);
  });
}
