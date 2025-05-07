import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const notificationsComponent = 'c-quantic-notifications';

export interface NotificationsSelector extends ComponentSelector {
  notifications: () => CypressSelector;
  notification: (index: number) => CypressSelector;
}

export const NotificationsSelectors: NotificationsSelector = {
  get: () => cy.get(notificationsComponent),

  notifications: () =>
    NotificationsSelectors.get().find('[data-testid="notification"]'),
  notification: (index: number) =>
    NotificationsSelectors.get().find('[data-testid="notification"]').eq(index),
};
