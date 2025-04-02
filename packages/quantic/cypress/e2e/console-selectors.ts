export const ConsoleAliases = {
  Error: '@console-error',
  Warning: '@console-warning',
};

export const ConsoleSelectors = {
  error: () => cy.get(ConsoleAliases.Error),
  warn: () => cy.get(ConsoleAliases.Warning),
};

export function stubConsoleError(win: Cypress.AUTWindow) {
  cy.stub(win.console, 'error').as(ConsoleAliases.Error.substring(1));
}

export function stubConsoleWarning(win: Cypress.AUTWindow) {
  cy.stub(win.console, 'warn').as(ConsoleAliases.Warning.substring(1));
}
