export interface ComponentSelector {
  get: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export interface FacetSelector extends ComponentSelector {
  searchInput: () => Cypress.Chainable<JQuery<HTMLElement>>;
  valueLabel: () => Cypress.Chainable<JQuery<HTMLElement>>;
  values: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertLabelContains(
  FacetSelector: FacetSelector,
  label: string
) {
  it(`should have the label "${label}"`, () => {
    FacetSelector.valueLabel().contains(label);
  });
}

export function assertDisplayValues(
  FacetSelector: FacetSelector,
  display: boolean
) {
  it(`${should(display)} display facet values`, () => {
    FacetSelector.values().should(display ? 'exist' : 'not.exist');
  });
}
