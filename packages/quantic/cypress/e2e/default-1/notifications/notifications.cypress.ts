import {configure} from '../../../page-objects/configurator';
import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {
  getQueryAlias,
  interceptSearch,
  mockSearchWithNotifyTrigger,
} from '../../../page-objects/search';
import {NotificationsExpectations as Expect} from './notifications-expectations';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
const exampleNotifications = ['Notification one', 'Notification two'];

interface NotificationsOptions {
  useCase: string;
}

describe('quantic-notifications', () => {
  const pageUrl = 's/quantic-notifications';

  function visitNotifications(options: Partial<NotificationsOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('when no notification is fired by the pipeline trigger', () => {
        it('should not render any notification', () => {
          visitNotifications({useCase: param.useCase});
          mockSearchWithNotifyTrigger(param.useCase, []);

          cy.wait(getQueryAlias(param.useCase));
          Expect.displayNotifications(false);
        });
      });

      describe('when some notifications are fired by the pipeline trigger', () => {
        it('should render the notifications', () => {
          mockSearchWithNotifyTrigger(param.useCase, exampleNotifications);
          visitNotifications({useCase: param.useCase});

          cy.wait(getQueryAlias(param.useCase));
          Expect.displayNotifications(true);
          Expect.logQueryPipelineTriggersNotification(exampleNotifications);
          exampleNotifications.forEach((notification, index) => {
            Expect.notificationContains(index, notification);
          });
        });
      });
    });
  });
});
