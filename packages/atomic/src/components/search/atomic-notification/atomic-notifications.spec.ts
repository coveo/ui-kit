import {buildNotifyTrigger, type NotifyTriggerState} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeNotifyTrigger} from '@/vitest-utils/testing-helpers/fixtures/headless/search/notify-trigger-controller';
import type {AtomicNotifications} from './atomic-notifications';
import './atomic-notifications';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-notifications', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedNotifyTrigger: ReturnType<typeof buildNotifyTrigger>;

  const renderNotifications = async ({
    props = {},
    notifyTriggerState = {},
  }: {
    props?: Partial<AtomicNotifications>;
    notifyTriggerState?: Partial<NotifyTriggerState>;
  } = {}) => {
    mockedNotifyTrigger = buildFakeNotifyTrigger({state: notifyTriggerState});

    vi.mocked(buildNotifyTrigger).mockReturnValue(mockedNotifyTrigger);

    const {element} = await renderInAtomicSearchInterface<AtomicNotifications>({
      template: html`<atomic-notifications
        .headingLevel=${props.headingLevel ?? 0}
        .icon=${props.icon}
      ></atomic-notifications>`,
      selector: 'atomic-notifications',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      parts: (el: AtomicNotifications) => ({
        notifications: el.shadowRoot?.querySelector('[part="notifications"]'),
        notification: el.shadowRoot?.querySelectorAll('[part="notification"]'),
        icon: el.shadowRoot?.querySelectorAll('[part="icon"]'),
        text: el.shadowRoot?.querySelectorAll('[part="text"]'),
      }),
    };
  };

  describe('when there are no notifications', () => {
    it('should render nothing', async () => {
      const {element} = await renderNotifications({
        notifyTriggerState: {
          notifications: [],
        },
      });

      expect(element).toBeEmptyDOMElement();
    });
  });

  describe('when there are notifications', () => {
    const notifications = ['First notification', 'Second notification'];

    it('should render correctly', async () => {
      const {element} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      expect(element).toBeDefined();
    });

    it('should call buildNotifyTrigger with the engine', async () => {
      await renderNotifications({
        notifyTriggerState: {notifications},
      });

      expect(buildNotifyTrigger).toHaveBeenCalledExactlyOnceWith(mockedEngine);
    });

    it('should bind to the notify trigger controller', async () => {
      const buildNotifyTriggerMock = vi.mocked(buildNotifyTrigger);
      const {element} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      expect(element.notifyTrigger).toBe(
        buildNotifyTriggerMock.mock.results[0].value
      );
    });

    it('should render the notifications container', async () => {
      const {element, parts} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      expect(parts(element).notifications).toBeInTheDocument();
    });

    it('should render all notifications', async () => {
      const {element, parts} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      const notificationElements = parts(element).notification;
      expect(notificationElements).toHaveLength(2);
    });

    it('should render notification text correctly', async () => {
      const {element, parts} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      const textElements = parts(element).text;
      expect(textElements?.[0]).toHaveTextContent('First notification');
      expect(textElements?.[1]).toHaveTextContent('Second notification');
    });

    it('should render icons for each notification', async () => {
      const {element, parts} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      const iconElements = parts(element).icon;
      expect(iconElements).toHaveLength(2);
    });

    it('should render heading with sr-only class', async () => {
      const {element} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      const heading = element.shadowRoot?.querySelector('.sr-only');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Notifications');
    });

    it('should render heading at level 0 (div) by default', async () => {
      const {element} = await renderNotifications({
        notifyTriggerState: {notifications},
      });

      const div = element.shadowRoot?.querySelector('div.sr-only');
      expect(div).toBeInTheDocument();
    });

    it('should render heading at specified level', async () => {
      const {element} = await renderNotifications({
        props: {headingLevel: 4},
        notifyTriggerState: {notifications},
      });

      const heading = element.shadowRoot?.querySelector('h4.sr-only');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Notifications');
    });

    it('should use custom icon when provided', async () => {
      const customIcon = 'custom-icon.svg';
      const {element} = await renderNotifications({
        props: {icon: customIcon},
        notifyTriggerState: {notifications},
      });

      const iconElement = element.shadowRoot?.querySelector('atomic-icon');
      expect(iconElement).toHaveAttribute('icon', customIcon);
    });
  });

  describe('props', () => {
    it('should have default headingLevel of 0', async () => {
      const {element} = await renderNotifications();
      expect(element.headingLevel).toBe(0);
    });

    it('should allow setting headingLevel', async () => {
      const {element} = await renderNotifications({
        props: {headingLevel: 3},
      });
      expect(element.headingLevel).toBe(3);
    });

    it('should allow setting icon', async () => {
      const icon = 'test-icon.svg';
      const {element} = await renderNotifications({
        props: {icon},
      });
      expect(element.icon).toBe(icon);
    });
  });
});
