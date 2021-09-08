import {ComponentSelector} from '../common-selectors';

export interface BaseFacetSelector extends ComponentSelector {
  label: () => Cypress.Chainable<JQuery<HTMLElement>>;
  values: () => Cypress.Chainable<JQuery<HTMLElement>>;
  clearButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  valueLabel: () => Cypress.Chainable<JQuery<HTMLElement>>;
  collapseButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
  expandButton: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetWithCheckboxSelector extends ComponentSelector {
  selectedCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
  idleCheckboxValue: () => Cypress.Chainable<JQuery<HTMLElement>>;
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
