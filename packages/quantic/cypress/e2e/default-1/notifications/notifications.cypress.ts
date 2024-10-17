import {configure} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  interceptSearch,
  mockSearchWithNotifyTrigger,
} from '../../../page-objects/search';
import {NotificationsExpectations as Expect} from './notifications-expectations';

const exampleNotifications = ['Notification one', 'Notification two'];

interface NotificationsOptions {
  useCase: string;
}

const enum useCaseEnum {
  search = 'search',
  insight = 'insights',
}

const useCaseParamTest = [
  {
    useCase: useCaseEnum.search,
    label: 'with search use case',
  },
  {
    useCase: useCaseEnum.insight,
    label: 'with insight use case',
  },
];

describe('quantic-notifications', () => {
  const pageUrl = 's/quantic-notifications';

  function visitNotifications(options: Partial<NotificationsOptions>) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  useCaseParamTest.forEach((param) => {
    describe(`when no notification is fired by the pipeline trigger ${param.label}`, () => {
      it('should not render any notification', () => {
        visitNotifications({useCase: param.useCase});

        cy.wait(getQueryAlias(param.useCase));
        Expect.displayNotifications(false);
      });
    });

    describe(`when some notifications are fired by the pipeline trigger for the ${param.label}`, () => {
      it('should render the notifications', () => {
        visitNotifications({useCase: param.useCase});
        mockSearchWithNotifyTrigger(param.useCase, exampleNotifications);

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
