export const triggerCaseFieldInputChange = () =>
  cy.get('c-action-change-field-input button').click();

export const setPayload = (payload: string) =>
  cy
    .get('c-action-change-field-input input')
    .type(payload, {parseSpecialCharSequences: false});

export const clearInput = () =>
  cy.get('c-action-change-field-input input').clear();
