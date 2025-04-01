import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultQuickview from '../quanticResultQuickview';

const selectors = {
  quickViewButton: '[data-cy="quick-view-button"]',
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

const functionMocks = {
  pushRecentResult: jest.fn(),
};

let useCase = 'search';

function mockHeadless() {
  jest.spyOn(mockHeadlessLoader, 'getHeadlessBundle').mockReturnValue({
    buildQuickview: () => ({
      state: {resultHasPreview: true},
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

  describe('when the component is used in the search use case', () => {
    beforeAll(() => {
      useCase = 'search';
    });

    it('should dispatch the pushRecentResult action', async () => {
      const element = createTestComponent();
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickViewButton
      );
      await quickViewButton.click();
      await flushPromises();

      expect(functionMocks.pushRecentResult).toHaveBeenCalled();
    });
  });

  describe('when the component is not used in the search use case', () => {
    beforeAll(() => {
      useCase = 'insight';
    });

    it('should not dispatch the pushRecentResult action', async () => {
      const element = createTestComponent();
      await flushPromises();

      const quickViewButton = element.shadowRoot.querySelector(
        selectors.quickViewButton
      );
      await quickViewButton.click();
      await flushPromises();

      expect(functionMocks.pushRecentResult).not.toHaveBeenCalled();
    });
  });
});
