export const notificationComponent = 'atomic-notification';
export const NotificationSelectors = {
  shadow: () => cy.get(notificationComponent).shadow(),
  text: () => NotificationSelectors.shadow().find('[part="text"]'),
};
