const selectors = {
  try: 'lightning-button[data-cy="configurator-try"]',
};

const getInputSelector = (field: string): string =>
  `lightning-input[data-cy="configurator-${field}"] input`;

export const configure = (options: Record<string, string>) => {
  Object.keys(options).forEach((key) => {
    cy.get(getInputSelector(key)).invoke('val', options[key]);
  });

  cy.get(selectors.try).click();
};
