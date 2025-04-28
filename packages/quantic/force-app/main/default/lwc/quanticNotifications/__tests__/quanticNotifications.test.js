/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticNotifications from 'c/quanticNotifications';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {AriaLiveRegion} from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils');

const exampleNotifications = ['notification1', 'notification2'];

let notificationsState = {
  notifications: exampleNotifications,
};
let isInitialized = false;

const exampleEngine = {
  id: 'mock engine',
};

const mockSearchStatusState = {
  hasResults: true,
  hasError: false,
};

const functionsMocks = {
  buildNotifyTrigger: jest.fn(() => ({
    state: notificationsState,
    subscribe: functionsMocks.subscribe,
  })),
  dispatchMessage: jest.fn(() => {}),
  buildSearchStatus: jest.fn(() => ({
    state: mockSearchStatusState,
    subscribe: jest.fn((callback) => {
      functionsMocks.subscribe.callback = callback;
      return functionsMocks.unsubscribeSearchStatus;
    }),
  })),
  subscribe: jest.fn((callback) => {
    callback();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  unsubscribeSearchStatus: jest.fn(() => {}),
};

// @ts-ignore
AriaLiveRegion.mockImplementation(() => {
  return {
    dispatchMessage: functionsMocks.dispatchMessage,
  };
});

const selectors = {
  notifications: '[data-testid="notification"]',
  initializationError: 'c-quantic-component-error',
  notificationCloseButton: 'lightning-button-icon',
};

const defaultOptions = {
  engineId: 'exampleEngineId',
};

const createTestComponent = buildCreateTestComponent(
  QuanticNotifications,
  'c-quantic-notifications',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildNotifyTrigger: functionsMocks.buildNotifyTrigger,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticNotifications && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticNotifications) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-notifications', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
    notificationsState = {
      notifications: exampleNotifications,
    };
  });

  describe('when an error occurs during initialization', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      const notification = element.shadowRoot.querySelector(
        selectors.notifications
      );

      expect(initializationError).not.toBeNull();
      expect(notification).toBeNull();
    });
  });

  describe('component initialization', () => {
    it('should build the notifyTrigger and searchStatus controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildNotifyTrigger).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildNotifyTrigger).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless notify trigger state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call AriaLiveRegion with the right parameters', async () => {
      await createTestComponent();
      await flushPromises();

      expect(AriaLiveRegion).toHaveBeenCalledTimes(1);
      expect(AriaLiveRegion).toHaveBeenCalledWith(
        'notifications',
        expect.anything()
      );
    });
  });

  describe('when the component is initialized successfully', () => {
    describe('when some notifications are present in the state', () => {
      it('should render the notifications component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const notifications = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notifications).not.toBeNull();
        expect(notifications.length).toBe(exampleNotifications.length);
        notifications.forEach((notification, index) => {
          expect(notification.textContent).toEqual(exampleNotifications[index]);
        });
      });

      it('should call dispatchMessage with the correct message', async () => {
        await createTestComponent();
        await flushPromises();

        const expectedMessage =
          ' Notification 1: notification1 Notification 2: notification2';

        expect(functionsMocks.dispatchMessage).toHaveBeenCalledTimes(1);
        expect(functionsMocks.dispatchMessage).toHaveBeenCalledWith(
          expectedMessage
        );
      });
    });

    describe('when no notifications are present in the state', () => {
      beforeEach(() => {
        notificationsState = {
          notifications: [],
        };
      });

      it('should not render the notifications component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const notifications = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notifications.length).toEqual(0);
      });
    });

    describe('when there is an error following a search', () => {
      it('should not render the notifications component', async () => {
        const element = createTestComponent();
        mockSearchStatusState.hasError = true;
        functionsMocks.subscribe.callback();
        await flushPromises();

        const notifications = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notifications.length).toEqual(0);
      });
    });
  });

  describe('when clicking on a notification close button', () => {
    it('should properly dismiss that notification', async () => {
      const element = createTestComponent();
      await flushPromises();

      const notificationsBeforeClose = element.shadowRoot.querySelectorAll(
        selectors.notifications
      );

      const firstNotificationCloseButton =
        notificationsBeforeClose[0].querySelector(
          selectors.notificationCloseButton
        );
      firstNotificationCloseButton.click();
      await flushPromises();

      const notificationsAfterClose = element.shadowRoot.querySelectorAll(
        selectors.notifications
      );

      expect(notificationsAfterClose.length).toEqual(
        exampleNotifications.length - 1
      );
      expect(notificationsAfterClose[0].textContent).toEqual(
        exampleNotifications[1]
      );
    });

    describe('when triggering another search with the same query', () => {
      it('should reset the visibility of the notifications', async () => {
        const element = createTestComponent();
        await flushPromises();

        const notificationsBeforeClose = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notificationsBeforeClose.length).toEqual(
          exampleNotifications.length
        );

        const firstNotificationCloseButton =
          notificationsBeforeClose[0].querySelector(
            selectors.notificationCloseButton
          );
        firstNotificationCloseButton.click();
        await flushPromises();

        const notificationsAfterClose = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notificationsAfterClose.length).toEqual(
          exampleNotifications.length - 1
        );

        mockSearchStatusState.hasError = false;
        functionsMocks.subscribe.callback();
        await flushPromises();

        const notificationsAfterSearch = element.shadowRoot.querySelectorAll(
          selectors.notifications
        );

        expect(notificationsAfterSearch.length).toEqual(
          exampleNotifications.length
        );
        notificationsAfterSearch.forEach((notification, index) => {
          expect(notification.textContent).toEqual(exampleNotifications[index]);
        });
      });
    });
  });
});
