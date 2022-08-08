import {TestFixture} from '../fixtures/test-fixture';
import {addNotification, addNotifyTriggers} from './notification-actions';
import {
  notificationComponent,
  NotificationSelectors,
} from './notification-selectors';

describe('Notification Test Suites', () => {
  describe('without any notify trigger', () => {
    before(() => {
      new TestFixture().with(addNotification()).init();
    });

    it('should be hidden', () => {
      cy.get(notificationComponent).should('be.hidden');
    });
  });

  describe('with multiple notify triggers', () => {
    const notifications = ['abc', 'def'];
    before(() => {
      new TestFixture()
        .with(addNotification())
        .with(addNotifyTriggers(notifications))
        .init();
    });

    it('should only render the first notification', () => {
      NotificationSelectors.text().its('length').should('eq', 1);
      NotificationSelectors.text().should('have.text', notifications[0]);
    });
  });

  describe('with a notify trigger and a heading level of 4', () => {
    before(() => {
      new TestFixture()
        .with(addNotification({props: {'heading-level': 4}}))
        .with(addNotifyTriggers(['abc']))
        .init();
    });

    it('should contain a h4', () => {
      NotificationSelectors.shadow().find('h4').should('exist');
    });
  });
});
