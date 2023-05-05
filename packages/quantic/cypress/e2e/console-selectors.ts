export const ConsoleAliases = {
  Error: '@console-error',
  Warning: '@console-warning',
};

export const ConsoleSelectors = {
  error: () => cy.get(ConsoleAliases.Error),
  warn: () => cy.get(ConsoleAliases.Warning),
};

export function spyConsoleError(win: Cypress.AUTWindow) {
  cy.spy(win.console, 'error').as(ConsoleAliases.Error.substring(1));
}

export function spyConsoleWarning(win: Cypress.AUTWindow) {
  cy.spy(win.console, 'warn').as(ConsoleAliases.Warning.substring(1));
}
