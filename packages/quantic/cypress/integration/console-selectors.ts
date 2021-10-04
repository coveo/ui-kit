export const ConsoleAliases = {
  Error: '@console-error',
};

export const ConsoleSelectors = {
  error: () => cy.get(ConsoleAliases.Error),
};

export function stubConsoleError(win: Cypress.AUTWindow) {
  cy.stub(win.console, 'error').as(ConsoleAliases.Error.substring(1));
}
