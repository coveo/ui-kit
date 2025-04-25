/* eslint-disable no-import-assign */
import QuanticResultCopyToClipboard from '../quanticResultCopyToClipboard';
import {cleanup, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import * as quanticUtils from 'c/quanticUtils';

const defaultTemplate = '${title}\n${clickUri}';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  ...jest.requireActual('c/quanticUtils'),
  copyToClipboard: jest.fn(() => Promise.resolve()),
  buildTemplateTextFromResult: jest.fn(() => defaultTemplate),
}));

let isInitialized = false;
const functionMocks = {
  logCopyToClipboard: jest.fn(() => Promise.resolve()),
  dispatch: jest.fn(() => {}),
};

const exampleEngine = {
  id: 'exampleEngineId',
  dispatch: functionMocks.dispatch,
};

const defaultOptions = {
  engineId: exampleEngine.id,
  result: {
    clickUri: 'https://example.com',
    title: 'Example Title',
  },
  label: 'Copy',
  successLabel: 'Copied',
  textTemplate: defaultTemplate,
};

const copyToClipboardEvent = new CustomEvent('quantic__copytoclipboard', {
  bubbles: true,
});

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
      loadInsightAnalyticsActions: jest.fn(() => {
        return {
          logCopyToClipboard: functionMocks.logCopyToClipboard,
        };
      }),
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

async function flushPromises() {
  return Promise.resolve();
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
      console.error = jest.fn();
      console.warn = jest.fn();
    });

    it('should render the Quantic Result Action properly', async () => {
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

    describe('when passing custom options', () => {
      it('should render the Quantic Result Action component with the provided custom label', async () => {
        const customLabel = 'Custom Label';
        const element = createTestComponent({
          ...defaultOptions,
          label: customLabel,
        });
        await flushPromises();

        const resultAction = element.shadowRoot.querySelector(
          selectors.quanticResultAction
        );

        expect(resultAction).not.toBeNull();
        expect(resultAction.label).toBe(customLabel);
      });

      it('should call the buildTemplateTextFromResult function with a provided custom textTemplate', async () => {
        const customTemplate = 'Custom: ${title} - ${clickUri}';
        const mockBuildTemplateTextFromResult =
          quanticUtils.buildTemplateTextFromResult;
        const element = createTestComponent({
          ...defaultOptions,
          textTemplate: customTemplate,
        });
        await flushPromises();

        element.dispatchEvent(copyToClipboardEvent);

        expect(mockBuildTemplateTextFromResult).toHaveBeenCalledTimes(1);
        expect(mockBuildTemplateTextFromResult).toHaveBeenCalledWith(
          customTemplate,
          defaultOptions.result
        );
      });

      it('should render the Quantic Result Action component with the provided custom successLabel', async () => {
        const customSuccessLabel = 'Custom Success Label';
        const element = createTestComponent({
          ...defaultOptions,
          successLabel: customSuccessLabel,
        });
        await flushPromises();

        const resultAction = element.shadowRoot.querySelector(
          selectors.quanticResultAction
        );

        element.dispatchEvent(copyToClipboardEvent);
        await flushPromises();

        expect(resultAction.label).toBe(customSuccessLabel);
      });
    });

    describe('when receiving the copy to clipboard event', () => {
      it('should call the buildTemplateTextFromResult function with the correct parameters', async () => {
        const mockBuildTemplateTextFromResult =
          quanticUtils.buildTemplateTextFromResult;
        const element = createTestComponent();

        element.dispatchEvent(copyToClipboardEvent);
        await flushPromises();

        expect(mockBuildTemplateTextFromResult).toHaveBeenCalledTimes(1);
        expect(mockBuildTemplateTextFromResult).toHaveBeenCalledWith(
          defaultOptions.textTemplate,
          defaultOptions.result
        );
      });

      describe('when calling the copyToClipboard function', () => {
        it('should dispatch the logCopyToClipboard action', async () => {
          const element = createTestComponent();
          await flushPromises();

          const resultAction = element.shadowRoot.querySelector(
            selectors.quanticResultAction
          );
          expect(resultAction).not.toBeNull();

          await element.dispatchEvent(copyToClipboardEvent);

          expect(functionMocks.logCopyToClipboard).toHaveBeenCalledTimes(1);
          expect(functionMocks.logCopyToClipboard).toHaveBeenCalledWith(
            defaultOptions.result
          );
        });

        it('should call the copyToClipboard function with the correct parameters when the promise resolved', async () => {
          const mockCopyToClipboard = quanticUtils.copyToClipboard;
          const element = createTestComponent();
          await flushPromises();

          const resultAction = element.shadowRoot.querySelector(
            selectors.quanticResultAction
          );

          await element.dispatchEvent(copyToClipboardEvent);
          await flushPromises();

          expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
          expect(mockCopyToClipboard).toHaveBeenCalledWith(
            defaultOptions.textTemplate
          );
          expect(resultAction.loading).toBe(false);
        });

        it('should log an error in the console when the promise is rejected', async () => {
          const mockCopyToClipboard = quanticUtils.copyToClipboard;
          const element = createTestComponent();
          await flushPromises();

          const resultAction = element.shadowRoot.querySelector(
            selectors.quanticResultAction
          );

          // @ts-ignore
          mockCopyToClipboard.mockImplementationOnce(() =>
            Promise.reject(new Error('Copy to clipboard error'))
          );

          await element.dispatchEvent(copyToClipboardEvent);
          await flushPromises();

          expect(console.error).toHaveBeenCalledWith(
            'Copy to clipboard action failed.',
            expect.any(Error)
          );
          expect(resultAction.loading).toBe(false);
        });

        describe('when the tooltip is displayed', () => {
          beforeAll(() => {
            jest.useFakeTimers();
          });

          afterAll(() => {
            jest.useRealTimers();
          });

          it('should display the success label then reset the initial label after 1000ms', async () => {
            const element = createTestComponent();
            await flushPromises();

            const resultAction = element.shadowRoot.querySelector(
              selectors.quanticResultAction
            );
            expect(resultAction).not.toBeNull();

            element.dispatchEvent(copyToClipboardEvent);
            await flushPromises();

            expect(resultAction.label).toBe(defaultOptions.successLabel);

            await jest.advanceTimersByTimeAsync(1000);

            expect(resultAction.label).toBe(defaultOptions.label);
          });
        });
      });
    });
  });
});
