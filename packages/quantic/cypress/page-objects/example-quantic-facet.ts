export const setupAliases = () =>
  cy
    .get('lightning-input[data-cy="configurator-field"] input')
    .as('configurator-field')
    .get('lightning-input[data-cy="configurator-label"] input')
    .as('configurator-label')
    .get('lightning-button[data-cy="configurator-try"]')
    .as('configurator-try');
