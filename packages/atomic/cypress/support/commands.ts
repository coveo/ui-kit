// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getAnalyticsAt(selector: string, order: number): Chainable<any>;
      getTextOfAllElements(selector: string): Chainable<any>;
    }
  }
}

Cypress.Commands.add('getAnalyticsAt', (selector: string, order: number) => {
  for (let i = 0; i < order; i++) {
    cy.wait(selector);
  }
  cy.wait(selector).then((interception) => {
    cy.wrap(interception.request.body);
  });
});

Cypress.Commands.add('getTextOfAllElements', (selector: string) => {
  cy.get(selector).then((elems) => {
    const originalValues = [...elems].map((el: any) => el.textContent.trim());
    cy.wrap(originalValues);
  });
});

// Convert this to a module instead of script (allows import/export)
export {};
