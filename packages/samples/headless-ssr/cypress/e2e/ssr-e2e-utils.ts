export const ConsoleAliases = {
  error: '@consoleError',
  warn: '@consoleWarn',
  log: '@consoleLog',
};

export function stubConsole() {
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as(ConsoleAliases.error.substring(1));
    cy.stub(win.console, 'warn').as(ConsoleAliases.warn.substring(1));
    cy.stub(win.console, 'log').as(ConsoleAliases.log.substring(1));
  });
}

export function waitForHydration() {
  cy.get('#hydrated-indicator').should('have.text', 'yes');
}
