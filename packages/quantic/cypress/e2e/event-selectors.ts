export const EventSelectors = {
  eventsReceived: () => cy.get('c-event-listener').find('.event__received'),
  eventsNotReceived: () =>
    cy.get('c-event-listener').find('.event__not-received'),
};
