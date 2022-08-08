import {addTag, TestFixture} from '../fixtures/test-fixture';
import {notificationComponent} from './notification-selectors';

export interface AddNotificationProps {
  props?: {
    'heading-level'?: number;
  };
}

export const addNotification =
  (options: AddNotificationProps = {}) =>
  (env: TestFixture) =>
    addTag(env, notificationComponent, options.props ?? {});

export const addNotifyTriggers =
  (notifications: string[]) => (env: TestFixture) => {
    env.withCustomResponse((response) => ({
      ...response,
      triggers: notifications.map((notification) => ({
        type: 'notify',
        content: notification,
      })),
    }));
  };
