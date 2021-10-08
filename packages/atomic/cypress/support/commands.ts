// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      getAnalyticsAt(selector: string, order: number): Chainable<unknown>;
      getTextOfAllElements(selector: string): Chainable<unknown>;
      // https://github.com/cypress-io/cypress-documentation/issues/108
      state(key: string): CypressRequest[];
      shouldBeCalled(urlPart: string, timesCalled: number): Chainable<unknown>;
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

interface CypressRequest {
  xhr: {url: string};
}

// Only possible to filter on the url
Cypress.Commands.add('shouldBeCalled', (urlPart, timesCalled) => {
  cy.state('requests').forEach((call) =>
    console.log('Should be called contains: ', call.xhr.url)
  );
  expect(
    cy
      .state('requests')
      .filter((call: CypressRequest) => call.xhr.url.includes(urlPart)),
    `Url containing "${urlPart}"" should have been called ${timesCalled} times`
  ).to.have.length(timesCalled);
});

// Convert this to a module instead of script (allows import/export)
export {};
