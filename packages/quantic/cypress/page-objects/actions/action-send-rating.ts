export const sendRating = (idx: number) =>
  cy.get('c-action-send-rating button').eq(idx).click();
