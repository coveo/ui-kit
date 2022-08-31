import {TestFixture} from '../fixtures/test-fixture';
import {addNotifications, addNotifyTriggers} from './notifications-actions';
import {
  notificationsComponent,
  NotificationsSelectors,
} from './notifications-selectors';

describe('Notifications Test Suites', () => {
  describe('without any notify trigger', () => {
    before(() => {
      new TestFixture().with(addNotifications()).init();
    });

    it('should be hidden', () => {
      cy.get(notificationsComponent).should('be.hidden');
    });
  });

  describe('with multiple notify triggers', () => {
    const notifications = ['abc', 'def'];
    before(() => {
      new TestFixture()
        .with(addNotifications())
        .with(addNotifyTriggers(notifications))
        .init();
    });

    it('should only render the first notifications', () => {
      NotificationsSelectors.text().its('length').should('eq', 1);
      NotificationsSelectors.text().should('have.text', notifications[0]);
    });
  });

  describe('with a notify trigger and a heading level of 4', () => {
    before(() => {
      new TestFixture()
        .with(addNotifications({props: {'heading-level': 4}}))
        .with(addNotifyTriggers(['abc']))
        .init();
    });

    it('should contain a h4', () => {
      NotificationsSelectors.shadow().find('h4').should('exist');
    });
  });
});
