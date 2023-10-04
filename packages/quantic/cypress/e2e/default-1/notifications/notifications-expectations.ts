import {InterceptAliases} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {
  NotificationsSelector,
  NotificationsSelectors,
} from './notifications-selectors';

function notificationsExpectations(selector: NotificationsSelector) {
  return {
    displayNotifications: (display: boolean) => {
      selector
        .notifications()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the notifications`);
    },

    notificationContains: (index: number, content: string) => {
      selector
        .notification(index)
        .should('exist')
        .contains(content)
        .logDetail(`notification at index ${index} should contain ${content}`);
    },

    logQueryPipelineTriggersNotification: (notifications: string[]) => {
      cy.wait(InterceptAliases.UA.PipelineTriggers.notify)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          const customData = analyticsBody.customData;

          expect(analyticsBody).to.have.property(
            'eventType',
            'queryPipelineTriggers'
          );
          expect(customData).to.have.property('notifications');
          expect(customData.notifications).to.deep.equal(notifications);
        })
        .logDetail("should log the 'queryPipelineTriggers notify' UA event");
    },
  };
}

export const NotificationsExpectations = {
  ...notificationsExpectations(NotificationsSelectors),
};
