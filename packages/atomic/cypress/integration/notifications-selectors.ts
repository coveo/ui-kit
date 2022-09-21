import {AriaLiveSelectors} from './aria-live-selectors';

export const notificationsComponent = 'atomic-notifications';
export const NotificationsSelectors = {
  shadow: () => cy.get(notificationsComponent).shadow(),
  notifications: () =>
    NotificationsSelectors.shadow().find('[part="notifications"]'),
  text: () => NotificationsSelectors.shadow().find('[part="text"]'),
  ariaLive: () => AriaLiveSelectors.region('notifications'),
};
