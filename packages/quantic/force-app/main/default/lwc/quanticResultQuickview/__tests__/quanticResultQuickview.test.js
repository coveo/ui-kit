/* eslint-disable jest/no-conditional-expect */
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultQuickview from '../quanticResultQuickview';

const selectors = {
  quickviewButton: '[data-testid="quick-view-button"]',
  closeQuickviewButton: '[data-testid="quickview-modal__close-button"]',
  quickviewContent: 'c-quantic-quickview-content',
  icon: 'lightning-icon',
  tooltip: 'c-quantic-tooltip',
};

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_OpenPreview',
  () => ({default: 'Open preview'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_OpenFileForPreview',
  () => ({default: 'Open file for preview'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_NoPreviewAvailable',
  () => ({default: 'No preview available'}),
  {
    virtual: true,
  }
);
jest.mock('@salesforce/label/c.quantic_Close', () => ({default: 'Close'}), {
  virtual: true,
});

const exampleResult = {
  raw: {
    date: '123',
  },
  title: 'abc',
  uniqueId: '123',
  parentResult: {},
  childResults: [],
};

const functionMocks = {
  pushRecentResult: jest.fn(),
  dispatchEvent: jest.fn(),
};

function createTestComponent(options = {result: exampleResult}) {
  const element = createElement('c-quantic-result-quick-view', {
    is: QuanticResultQuickview,
  });

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      element[key] = value;
    }
  }

  document.body.appendChild(element);

  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let useCase = 'search';

function mockHeadless(hasPreview = true) {
  jest.spyOn(mockHeadlessLoader, 'getHeadlessBundle').mockReturnValue({
    buildQuickview: () => ({
      state: {resultHasPreview: hasPreview},
      fetchResultContent: jest.fn(),
      subscribe: jest.fn((callback) => {
        callback();
      }),
      cancelPendingSelect: jest.fn(),
    }),
    buildInteractiveResult: jest.fn(),
    loadRecentResultsActions: () => ({
      pushRecentResult: functionMocks.pushRecentResult,
    }),
  });

  jest
    .spyOn(mockHeadlessLoader, 'isHeadlessBundle')
    .mockReturnValue(useCase === 'search');

  jest.spyOn(mockHeadlessLoader, 'getHeadlessEnginePromise').mockReturnValue(
    new Promise((resolve) => {
      resolve({
        dispatch: jest.fn(),
      });
    })
  );
}

function mockBueno() {
  jest.spyOn(mockHeadlessLoader, 'getBueno').mockReturnValue(
    new Promise(() => {
      // @ts-ignore
      global.Bueno = {
        isString: jest
          .fn()
          .mockImplementation(
            (value) =>
              Object.prototype.toString.call(value) === '[object String]'
          ),
      };
    })
  );
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM.
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
}

describe('c-quantic-result-quick-view', () => {
  beforeEach(() => {
    mockHeadless();
    mockBueno();
  });

  afterEach(() => {
    cleanup();
  });

  it('should dispatch the pushRecentResult action', async () => {
    const element = createTestComponent();
    await flushPromises();

    const quickViewButton = element.shadowRoot.querySelector(
      selectors.quickviewButton
    );
    expect(quickViewButton.disabled).toBeFalsy();
    await quickViewButton.click();
    await flushPromises();

    // eslint-disable-next-line no-unused-vars
    const {parentResult, childResults, ...expectedPayload} = exampleResult;

    expect(functionMocks.pushRecentResult).toHaveBeenCalledTimes(1);
    expect(functionMocks.pushRecentResult).toHaveBeenCalledWith(
      expectedPayload
    );
  });

  describe('when the result has no preview', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockHeadless(false);
      mockBueno();
    });

    afterEach(() => {
      cleanup();
    });

    it('should disable the quickview button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickviewButton
      );

      expect(quickViewButton.disabled).toBeTruthy();
    });
  });

  describe('when the component has custom properties', () => {
    it('should render the custom icon correctly', async () => {
      const customIcon = 'utility:file';
      const customOptions = {
        result: exampleResult,
        previewButtonIcon: customIcon,
      };
      const element = createTestComponent(customOptions);
      await flushPromises();

      const quickViewIcon = element.shadowRoot.querySelector(selectors.icon);

      expect(quickViewIcon.iconName).toBe(customIcon);
    });

    it('should render the custom label correctly', async () => {
      const customOptions = {
        result: exampleResult,
        previewButtonLabel: 'Custom Label',
      };
      const element = createTestComponent(customOptions);
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickviewButton
      );

      expect(quickViewButton.textContent).toContain('Custom Label');
      expect(quickViewButton.querySelector(selectors.icon).classList).toContain(
        'slds-button__icon_right'
      );
    });

    it.each([['brand'], ['outline_brand'], ['result-action']])(
      'should render the custom variant %s',
      async (testVariant) => {
        const customOptions = {
          result: exampleResult,
          previewButtonVariant: testVariant,
          dispatchEvent: functionMocks.dispatchEvent,
        };

        const element = createTestComponent(customOptions);
        await flushPromises();

        const quickViewButton = element.shadowRoot.querySelector(
          selectors.quickviewButton
        );

        if (testVariant === 'result-action') {
          expect(quickViewButton.classList).toContain(
            'slds-button_icon-border-filled'
          );
          expect(functionMocks.dispatchEvent).toHaveBeenCalledTimes(2);
          expect(functionMocks.dispatchEvent.mock.calls[0][0].type).toBe(
            'quantic__resultactionregister'
          );
        } else {
          expect(quickViewButton.classList).toContain(
            `slds-button_${testVariant}`
          );
          expect(functionMocks.dispatchEvent).toHaveBeenCalledTimes(1);
          expect(functionMocks.dispatchEvent.mock.calls[0][0].type).toBe(
            'quantic__haspreview'
          );
        }
      }
    );

    it('should render the tooltip correctly', async () => {
      const customOptions = {
        result: exampleResult,
        tooltip: 'Custom Tooltip',
      };
      const element = createTestComponent(customOptions);
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector(selectors.tooltip);

      expect(tooltip.textContent).toBe('Custom Tooltip');
    });
  });

  describe('when the quickview is opened and closed', () => {
    it('should open the quickview modal', async () => {
      const element = createTestComponent();
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickviewButton
      );
      await quickViewButton.click();
      await flushPromises();

      const modal = element.shadowRoot.querySelector(
        selectors.quickviewContent
      );
      expect(modal).not.toBeNull();
    });

    it('should close the quickview modal', async () => {
      const element = createTestComponent();
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickviewButton
      );
      await quickViewButton.click();
      await flushPromises();

      const closeButton = element.shadowRoot.querySelector(
        selectors.closeQuickviewButton
      );
      await closeButton.click();
      await flushPromises();

      const modal = element.shadowRoot.querySelector(
        selectors.quickviewContent
      );
      expect(modal).toBeNull();
    });
  });
});
