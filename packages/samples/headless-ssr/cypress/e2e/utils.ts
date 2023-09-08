const searchBoxSelector = '.search-box input';
export const numResults = 10;

export const ConsoleAliases = {
  error: '@consoleError',
  warn: '@consoleWarn',
  log: '@consoleLog',
};

export function spyOnConsole() {
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as(ConsoleAliases.error.substring(1));
    cy.spy(win.console, 'warn').as(ConsoleAliases.warn.substring(1));
    cy.spy(win.console, 'log').as(ConsoleAliases.log.substring(1));
  });
}

export function waitForHydration() {
  cy.get('#hydrated-indicator').should('be.checked');
}

export function getResultTitles() {
  return (
    cy.get('.result-list li').invoke('map', function (this: HTMLElement) {
      return this.innerText;
    }) as Cypress.Chainable<JQuery<string>>
  ).invoke('toArray');
}

export function compareWithInitialResults() {
  getResultTitles().should('have.length', numResults).as('initial-results');
  waitForHydration();
  cy.get(searchBoxSelector).focus().type('abc{enter}');
  cy.wait(1000);
  cy.get<string>('@initial-results').then((initialResults) => {
    getResultTitles()
      .should('have.length', numResults)
      .and('not.deep.equal', initialResults);
  });
}
