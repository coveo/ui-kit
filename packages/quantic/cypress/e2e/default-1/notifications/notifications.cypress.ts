import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  mockSearchWithNotifyTrigger,
} from '../../../page-objects/search';
import {useCaseParamTest} from '../../../page-objects/use-case';
import {NotificationsExpectations as Expect} from './notifications-expectations';

const exampleNotifications = ['Notification one', 'Notification two'];

describe('quantic-notifications', () => {
  const pageUrl = 's/quantic-notifications';

  function visitNotifications() {
    interceptSearch();
    cy.visit(pageUrl);
    configure();
  }

  useCaseParamTest.forEach((param) => {
    describe(`when no notification is fired by the pipeline trigger ${param.label}`, () => {
      it('should not render any notification', () => {
        visitNotifications();

        cy.wait(getQueryAlias());
        Expect.displayNotifications(false);
      });
    });

    describe(`when some notifications are fired by the pipeline trigger for the ${param.label}`, () => {
      it('should render the notifications', () => {
        visitNotifications();
        mockSearchWithNotifyTrigger(param.useCase, exampleNotifications);

        cy.wait(getQueryAlias());
        Expect.displayNotifications(true);
        Expect.logQueryPipelineTriggersNotification(exampleNotifications);
        exampleNotifications.forEach((notification, index) => {
          Expect.notificationContains(index, notification);
        });
      });
    });
  });
});
