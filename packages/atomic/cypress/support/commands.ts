// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getAnalyticsAt(selector: string, order: number): Chainable<unknown>;
      getTextOfAllElements(selector: string): Chainable<unknown>;
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
    const originalValues = [...elems].map((el: HTMLElement) =>
      el.textContent?.trim()
    );
    cy.wrap(originalValues);
  });
});

// Convert this to a module instead of script (allows import/export)
export {};
