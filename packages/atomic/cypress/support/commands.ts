// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      getAnalyticsAt(selector: string, order: number): Chainable<any>;
      getTextOfAllElements(selector: string): Chainable<any>;
      injectComponent(componentInCode: string): Chainable<any>;
      initSearchInterface(executeSearch: boolean): Chainable<any>;
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

Cypress.Commands.add('injectComponent', (componentInCode: string) => {
  cy.get(searchInterfaceComponent).should('exist');
  cy.document().then((document) => {
    document.querySelector(
      searchInterfaceComponent
    )!.innerHTML = componentInCode;
  });
});

Cypress.Commands.add('initSearchInterface', (executeSearch: boolean) => {
  let searchInterface: any;
  cy.window()
    .then((window) => {
      searchInterface = window.document.querySelector(searchInterfaceComponent);
      return window.customElements.whenDefined(searchInterfaceComponent);
    })
    .then(() =>
      searchInterface.initialize({
        accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
        organizationId: 'searchuisamples',
      })
    )
    .then(() => executeSearch && searchInterface.executeFirstSearch());
});

// Convert this to a module instead of script (allows import/export)
export {};
