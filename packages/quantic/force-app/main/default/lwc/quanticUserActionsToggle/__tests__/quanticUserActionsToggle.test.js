/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticUserActionsToggle from 'c/quanticUserActionsToggle';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

const userActionsIcon = 'utility:clock';
const userActionsLabel = 'User actions';
jest.mock(
  '@salesforce/label/c.quantic_UserActions',
  () => ({default: userActionsLabel}),
  {
    virtual: true,
  }
);

const functionsMocks = {
  buildUserActions: jest.fn(() => ({
    logOpenUserActions: functionsMocks.logOpenUserActions,
  })),
  logOpenUserActions: jest.fn(() => {}),
};

const selectors = {
  userActionsToggleButton: '[data-test="user-actions-toggle-button"]',
  userActionsToggleButtonIcon:
    '[data-test="user-actions-toggle-button"] lightning-icon',
  userActionsTimeline:
    'c-quantic-modal [slot="content"] c-quantic-user-actions-timeline',
  modalHeaderIcon: 'c-quantic-modal [slot="header"] lightning-icon',
  modalHeaderLabel:
    'c-quantic-modal [slot="header"] [data-test="user-actions-modal-label"]',
  initializationError: 'c-quantic-component-error',
};

const exampleTicketCreationDateTime = '2024-01-01T00:00:00Z';
const exampleExcludedCustomActions = ['dummyEvent'];
const exampleUserId = 'someone@company.com';
const exampleEngineId = 'exampleEngineId';
const exampleEngine = {
  id: exampleEngineId,
};

const defaultOptions = {
  engineId: exampleEngineId,
  ticketCreationDateTime: exampleTicketCreationDateTime,
  excludedCustomActions: exampleExcludedCustomActions,
  userId: exampleUserId,
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-user-actions-toggle', {
    is: QuanticUserActionsToggle,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildUserActions: functionsMocks.buildUserActions,
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let isInitialized = false;

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticUserActionsToggle && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticUserActionsToggle) {
      element.setInitializationError();
    }
  };
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
  isInitialized = false;
}

describe('c-quantic-user-actions-toggle', () => {
  beforeAll(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  describe('controller initialization', () => {
    it('should build the controller with the right parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildUserActions).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildUserActions).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            ticketCreationDate: exampleTicketCreationDateTime,
            excludedCustomActions: exampleExcludedCustomActions,
          },
        }
      );
    });
  });

  it('should display the user actions toggle button', async () => {
    const element = createTestComponent();
    await flushPromises();

    const userActionsToggleButton = element.shadowRoot.querySelector(
      selectors.userActionsToggleButton
    );
    const userActionsToggleButtonIcon = element.shadowRoot.querySelector(
      selectors.userActionsToggleButtonIcon
    );

    expect(userActionsToggleButton).not.toBeNull();
    expect(userActionsToggleButton.title).toBe(userActionsLabel);
    expect(userActionsToggleButtonIcon.iconName).toBe(userActionsIcon);
  });

  it('should log analytics when the user action modal is opened', async () => {
    const element = createTestComponent();
    await flushPromises();

    const userActionsToggleButton = element.shadowRoot.querySelector(
      selectors.userActionsToggleButton
    );

    expect(userActionsToggleButton).not.toBeNull();
    await userActionsToggleButton.click();
    await flushPromises();

    expect(functionsMocks.logOpenUserActions).toHaveBeenCalledTimes(1);
  });

  it('should properly display the user actions modal header', async () => {
    const element = createTestComponent();
    await flushPromises();

    const modalHeaderIcon = element.shadowRoot.querySelector(
      selectors.modalHeaderIcon
    );
    const modalHeaderLabel = element.shadowRoot.querySelector(
      selectors.modalHeaderLabel
    );

    expect(modalHeaderIcon).not.toBeNull();
    expect(modalHeaderLabel).not.toBeNull();

    expect(modalHeaderIcon.iconName).toBe(userActionsIcon);
    expect(modalHeaderIcon.title).toBe(userActionsLabel);
    expect(modalHeaderLabel.textContent).toBe(userActionsLabel);
  });

  it('should properly display the user actions timeline inside the modal', async () => {
    const element = createTestComponent();
    await flushPromises();

    const userActionsTimeline = element.shadowRoot.querySelector(
      selectors.userActionsTimeline
    );

    expect(userActionsTimeline).not.toBeNull();
    expect(userActionsTimeline.engineId).toBe(exampleEngineId);
    expect(userActionsTimeline.userId).toBe(exampleUserId);
    expect(userActionsTimeline.ticketCreationDateTime).toBe(
      exampleTicketCreationDateTime
    );
    expect(userActionsTimeline.excludedCustomActions).toEqual(
      exampleExcludedCustomActions
    );
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    afterAll(() => {
      mockSuccessfulHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(initializationError).not.toBeNull();
    });
  });
});
