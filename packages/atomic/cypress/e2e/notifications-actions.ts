import {addTag, TestFixture} from '../fixtures/test-fixture';
import {notificationsComponent} from './notifications-selectors';

export interface AddNotificationsProps {
  props?: {
    'heading-level'?: number;
  };
}

export const addNotifications =
  (options: AddNotificationsProps = {}) =>
  (env: TestFixture) =>
    addTag(env, notificationsComponent, options.props ?? {});

export const addNotifyTriggers =
  (notifications: string[]) => (env: TestFixture) => {
    env.withCustomResponse((response) => ({
      ...response,
      triggers: notifications.map((notifications) => ({
        type: 'notify',
        content: notifications,
      })),
    }));
  };
