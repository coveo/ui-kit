import {TestFixture} from '../fixtures/test-fixture';
import {addNotifications, addNotifyTriggers} from './notifications-actions';
import {
  notificationsComponent,
  NotificationsSelectors,
} from './notifications-selectors';
import * as CommonAssertions from './common-assertions';

describe('Notifications Test Suites', () => {
  describe('without any notify trigger', () => {
    before(() => {
      new TestFixture().with(addNotifications()).init();
    });

    it('should be hidden', () => {
      cy.get(notificationsComponent).should('be.hidden');
    });
  });

  describe('with a single notify triggers', () => {
    const notification = 'Hello World!';
    before(() => {
      new TestFixture()
        .with(addNotifications())
        .with(addNotifyTriggers([notification]))
        .init();
    });

    it('should render a single notification', () => {
      NotificationsSelectors.notifications()
        .children()
        .its('length')
        .should('eq', 1);
      NotificationsSelectors.text().should('have.text', notification);
    });

    CommonAssertions.assertAriaLiveMessage(
      NotificationsSelectors.ariaLive,
      notification
    );
  });

  describe('with multiple notify triggers', () => {
    const notifications = ['abc', 'def'];
    before(() => {
      new TestFixture()
        .with(addNotifications())
        .with(addNotifyTriggers(notifications))
        .init();
    });

    it('should render each notification', () => {
      NotificationsSelectors.notifications()
        .children()
        .its('length')
        .should('eq', 2);
      NotificationsSelectors.text()
        .map(($el) => $el.text())
        .should('deep.equal', notifications);
    });

    CommonAssertions.assertAriaLiveMessage(
      NotificationsSelectors.ariaLive,
      notifications[0]
    );
    CommonAssertions.assertAriaLiveMessage(
      NotificationsSelectors.ariaLive,
      notifications[1]
    );
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
