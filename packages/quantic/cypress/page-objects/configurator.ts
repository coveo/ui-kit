const selectors = {
  try: 'lightning-button[data-cy="cfg-try"]',
  reset: 'lightning-button[data-cy="cfg-reset"]',
};

const getInputSelector = (field: string): string =>
  `lightning-input[data-cy="cfg-${field}"] input`;

export const configure = (
  options: Record<string, string | number | boolean | object> = {}
) => {
  // The form takes some time to load when Salesforce have been idle for a while.
  cy.get('slot[name="configuration"]', {timeout: 30000});

  Object.keys(options).forEach((key) => {
    cy.get(getInputSelector(key)).invoke('val', options[key].toString());
  });

  return cy
    .get(selectors.try)
    .click()
    .get('slot[name="preview"]', {timeout: 30000});
};

export const reset = () => cy.get(selectors.reset).click();
