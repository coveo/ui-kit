export interface ComponentSelector {
  get: () => Cypress.Chainable<JQuery<HTMLElement>>;
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}
