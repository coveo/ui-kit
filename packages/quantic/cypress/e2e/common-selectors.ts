export type CypressSelector = Cypress.Chainable<JQuery<HTMLElement>>;

export interface ComponentSelector {
  get: () => CypressSelector;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export interface ComponentErrorSelector {
  componentError: () => CypressSelector;
  componentErrorMessage: () => CypressSelector;
}
