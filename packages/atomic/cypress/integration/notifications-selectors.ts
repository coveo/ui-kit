export const notificationsComponent = 'atomic-notifications';
export const NotificationsSelectors = {
  shadow: () => cy.get(notificationsComponent).shadow(),
  text: () => NotificationsSelectors.shadow().find('[part="text"]'),
};
