/* eslint-disable no-import-assign */
import QuanticResultCopyToClipboard from '../quanticResultCopyToClipboard';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  ...jest.requireActual('c/quanticUtils'),
  copyToClipboard: jest.fn(() => Promise.resolve()),
}));

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultOptions = {
  engineId: exampleEngine.id,
  result: {
    clickUri: 'https://example.com',
    title: 'Example Title',
  },
  label: 'Copy',
  successLabel: 'Copied',
  textTemplate: '${title}\n${clickUri}',
};

const mockActions = {
  logCopyToClipboard: jest.fn(),
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  quanticResultAction: 'c-quantic-result-action',
};

const createTestComponent = buildCreateTestComponent(
  QuanticResultCopyToClipboard,
  'c-quantic-result-copy-to-clipboard',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      loadInsightAnalyticsActions: jest.fn(() => mockActions),
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticResultCopyToClipboard && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticResultCopyToClipboard) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-result-copy-to-clipboard', () => {
  afterEach(() => {
    cleanup();
    isInitialized = false;
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
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

  describe('when the component is initialized', () => {
    beforeEach(() => {
      prepareHeadlessState();
      mockSuccessfulHeadlessInitialization();
    });

    it('should render the Quantic Result Action component with the provided options', async () => {
      const expectedIconName = 'utility:copy';
      const expectedEventName = 'quantic__copytoclipboard';

      const element = createTestComponent();
      await flushPromises();

      const resultAction = element.shadowRoot.querySelector(
        selectors.quanticResultAction
      );

      expect(resultAction).not.toBeNull();
      expect(resultAction.label).toBe(defaultOptions.label);
      expect(resultAction.iconName).toEqual(expectedIconName);
      expect(resultAction.eventName).toEqual(expectedEventName);
    });

    it('should dispatch the logCopyToClipboard action when the copy to clipboard action is performed', async () => {
      const element = createTestComponent();
      await flushPromises();

      const resultAction = element.shadowRoot.querySelector(
        selectors.quanticResultAction
      );
      expect(resultAction).not.toBeNull();

      const copyToClipboardEvent = new CustomEvent('quantic__copytoclipboard');
      element.dispatchEvent(copyToClipboardEvent);
      await flushPromises();

      expect(mockActions.logCopyToClipboard).toHaveBeenCalledTimes(1);
      expect(mockActions.logCopyToClipboard).toHaveBeenCalledWith(
        defaultOptions.result
      );
    });
  });
});
