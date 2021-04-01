// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getAnalyticsAt(selector: string, order: number): Chainable<any>;
      getTextOfAllElements(selector: string): Chainable<any>;
      initSearchInterface(
        componentInCode: string,
        executeSearch: boolean
      ): Chainable<any>;
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

const searchInterfaceComponent = 'atomic-search-interface';
Cypress.Commands.add(
  'initSearchInterface',
  (componentInCode: string, executeSearch: boolean) => {
    cy.window().then(async (window) => {
      await window.customElements.whenDefined(searchInterfaceComponent);
      const searchInterface: any = window.document.querySelector(
        searchInterfaceComponent
      );
      searchInterface.innerHTML = componentInCode;
      console.log(Date.now());
      await searchInterface.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
      });

      cy.wait(300).then(() => {
        executeSearch && searchInterface.executeFirstSearch();
      });
    });
  }
);

// Convert this to a module instead of script (allows import/export)
export {};
