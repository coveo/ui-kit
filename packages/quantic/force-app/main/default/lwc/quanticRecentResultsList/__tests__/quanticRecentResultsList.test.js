/* eslint-disable no-import-assign */
import QuanticRecentResultsList from 'c/quanticRecentResultsList';
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import * as utils from 'c/quanticUtils';

const exampleEngine = {
  id: 'exampleEngineId',
};
const localStorageKey = `${exampleEngine.id}_quantic-recent-results`;

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_RecentResults',
  () => ({default: 'Recent Results'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_Expand',
  () => ({default: 'Expand Recent results'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_Collapse',
  () => ({default: 'Collapse Recent results'}),
  {
    virtual: true,
  }
);

const mockResults = [
  {
    title: 'Result 1',
    clickUri: 'https://example.com/result1',
    uri: 'https://example.com/result1',
    excerpt: 'This is the first result.',
    uniqueId: '1',
  },
  {
    title: 'Result 2',
    clickUri: 'https://example.com/result2',
    uri: 'https://example.com/result2',
    excerpt: 'This is the second result.',
    uniqueId: '2',
  },
];

const defaultRecentResultsTitle = 'Recent Results';
const defaultResults = [];
const defaultMaxLength = 10;
let isInitialized = false;
let updateRecentResultsState;

const initialRecentResultsListState = {
  results: defaultResults,
  maxLength: defaultMaxLength,
};
let recentResultsListState = initialRecentResultsListState;

const functionMocks = {
  buildRecentResultsList: jest.fn(() => ({
    state: recentResultsListState,
    subscribe: functionMocks.recentResultsListSubscriber,
    clear: functionMocks.clear,
  })),
  recentResultsListSubscriber: jest.fn((callback) => {
    updateRecentResultsState = async () => {
      callback();
      await flushPromises();
    };
    return () => {};
  }),
  clear: jest.fn(),
  buildInteractiveRecentResult: jest.fn(),
};

const defaultOptions = {
  engineId: exampleEngine.id,
  maxLength: defaultMaxLength,
  label: defaultRecentResultsTitle,
  hideWhenEmpty: false,
  target: '_self',
  isCollapsed: false,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  quanticCardContainer: 'c-quantic-card-container',
  recentResultItem: '[data-testid="recent-result-item"]',
  toggleButton: '[data-testid="action-button"]',
  quanticRecentResultLink: 'c-quantic-recent-result-link',
};

const createTestComponent = buildCreateTestComponent(
  QuanticRecentResultsList,
  'c-quantic-recent-results-list',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildRecentResultsList: functionMocks.buildRecentResultsList,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRecentResultsList && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticRecentResultsList) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-recent-results-list', () => {
  beforeEach(() => {
    // @ts-ignore
    global.CoveoHeadless = {
      buildInteractiveRecentResult: functionMocks.buildInteractiveRecentResult,
    };
  });

  afterEach(() => {
    cleanup();
    recentResultsListState = initialRecentResultsListState;
    isInitialized = false;
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should display the placeholder component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );

      expect(placeholder).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.quanticCardContainer)
      ).toBeNull();
    });

    it('should build the controller and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionMocks.buildRecentResultsList).toHaveBeenCalledTimes(1);
      expect(functionMocks.buildRecentResultsList).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {results: defaultResults},
          options: expect.objectContaining({
            maxLength: defaultMaxLength,
          }),
        }
      );
      expect(functionMocks.recentResultsListSubscriber).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the error component', async () => {
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
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
      jest
        .spyOn(mockHeadlessLoader, 'getHeadlessEnginePromise')
        .mockImplementation(() => Promise.resolve(exampleEngine));
    });

    describe('when there are recent results', () => {
      const exampleResults = mockResults;

      beforeEach(() => {
        recentResultsListState = {
          ...recentResultsListState,
          results: exampleResults,
        };
      });

      it('should display the recent results list with the default options and no longer display the placeholder component', async () => {
        recentResultsListState = {
          results: exampleResults,
          maxLength: defaultMaxLength,
        };
        const element = createTestComponent();
        updateRecentResultsState();
        await flushPromises();

        const placeholder = element.shadowRoot.querySelector(
          selectors.placeholder
        );

        expect(placeholder).toBeNull();

        const recentResultsContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentResultsContainer).not.toBeNull();
        expect(recentResultsContainer.title).toBe(defaultRecentResultsTitle);

        const recentResultsListItems = element.shadowRoot.querySelectorAll(
          selectors.recentResultItem
        );

        expect(recentResultsListItems.length).toBe(exampleResults.length);
        recentResultsListItems.forEach((item, index) => {
          const resultLink = item.querySelector(
            selectors.quanticRecentResultLink
          );
          expect(resultLink.result).toEqual(mockResults[index]);
        });
      });

      it('should use the correct initial state retrieved from the localstorage', async () => {
        const getItemFromLocalStorageSpy = jest
          .spyOn(utils, 'getItemFromLocalStorage')
          .mockReturnValue(exampleResults);
        createTestComponent();
        await flushPromises();

        expect(functionMocks.buildRecentResultsList).toHaveBeenCalledTimes(1);
        expect(functionMocks.buildRecentResultsList).toHaveBeenCalledWith(
          exampleEngine,
          {
            initialState: {results: exampleResults},
            options: {maxLength: defaultMaxLength},
          }
        );

        expect(getItemFromLocalStorageSpy).toHaveBeenCalledTimes(1);
        expect(getItemFromLocalStorageSpy).toHaveBeenCalledWith(
          localStorageKey
        );
      });

      it('should call #setItemInLocalStorage function with the proper parameters when the recent result change in the state', async () => {
        const setItemInLocalStorageSpy = jest.spyOn(
          utils,
          'setItemInLocalStorage'
        );
        createTestComponent();
        recentResultsListState.results = exampleResults;
        updateRecentResultsState();
        await flushPromises();

        expect(setItemInLocalStorageSpy).toHaveBeenCalledWith(
          localStorageKey,
          exampleResults
        );
        expect(setItemInLocalStorageSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('with a custom #maxLength value', () => {
      it('should set the #maxLength value in the controller', async () => {
        const exampleResults = mockResults;
        const customMaxLength = 5;
        createTestComponent({...defaultOptions, maxLength: customMaxLength});
        updateRecentResultsState();
        await flushPromises();

        expect(functionMocks.buildRecentResultsList).toHaveBeenCalledTimes(1);
        expect(functionMocks.buildRecentResultsList).toHaveBeenCalledWith(
          exampleEngine,
          {
            initialState: {results: exampleResults},
            options: {maxLength: customMaxLength},
          }
        );
      });

      it('should not render more results than the #maxLength value', async () => {
        const customMaxLength = 1;
        // The component does not manage the length of the results list, the reducer does. So we need to set the state directly.
        recentResultsListState = {
          ...recentResultsListState,
          results: mockResults.slice(0, customMaxLength),
        };
        const element = createTestComponent({
          ...defaultOptions,
          maxLength: customMaxLength,
        });
        updateRecentResultsState();
        await flushPromises();

        const recentResultsListItems = element.shadowRoot.querySelectorAll(
          selectors.recentResultItem
        );

        expect(recentResultsListItems.length).toBe(customMaxLength);
        recentResultsListItems.forEach((item, index) => {
          const resultLink = item.querySelector(
            selectors.quanticRecentResultLink
          );
          expect(resultLink.result).toEqual(mockResults[index]);
        });
      });
    });

    describe('with a custom #label value', () => {
      it('should display the custom label in the title of the component', async () => {
        const customLabel = 'My Custom Label';
        const element = createTestComponent({
          ...defaultOptions,
          label: customLabel,
        });
        updateRecentResultsState();
        await flushPromises();

        const recentResultsContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentResultsContainer).not.toBeNull();
        expect(recentResultsContainer.title).toBe(customLabel);
      });
    });

    describe('the #hideWhenEmpty property', () => {
      describe('when there are recent results', () => {
        it('should display the recent results card when set to true', async () => {
          recentResultsListState = {
            ...recentResultsListState,
            results: mockResults,
          };
          const element = createTestComponent({
            ...defaultOptions,
            hideWhenEmpty: true,
          });
          updateRecentResultsState();
          await flushPromises();

          const recentResultsContainer = element.shadowRoot.querySelector(
            selectors.quanticCardContainer
          );
          expect(recentResultsContainer).not.toBeNull();
        });
      });

      describe('when there are no recent results', () => {
        beforeEach(() => {
          recentResultsListState = {
            ...recentResultsListState,
            results: [],
          };
        });
        it('should display an empty list when it is set to false', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            hideWhenEmpty: false,
          });
          updateRecentResultsState();
          await flushPromises();

          const recentResultsContainer = element.shadowRoot.querySelector(
            selectors.quanticCardContainer
          );
          expect(recentResultsContainer).not.toBeNull();
          expect(recentResultsContainer.title).toBe(defaultRecentResultsTitle);

          const recentResultsListItems = element.shadowRoot.querySelectorAll(
            selectors.recentResultItem
          );
          expect(recentResultsListItems.length).toBe(0);
        });

        it('should not display a recent results card when it is set to true', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            hideWhenEmpty: true,
          });
          await flushPromises();

          const recentResultsContainer = element.shadowRoot.querySelector(
            selectors.quanticCardContainer
          );
          expect(recentResultsContainer).toBeNull();
        });
      });
    });

    describe('with a custom #target value', () => {
      it('should pass the target property to the result link component', async () => {
        const customTarget = '_blank';
        const exampleResults = mockResults;
        recentResultsListState = {
          ...recentResultsListState,
          results: exampleResults,
        };
        const element = createTestComponent({
          ...defaultOptions,
          target: customTarget,
        });
        await flushPromises();

        const recentResultLinks = element.shadowRoot.querySelectorAll(
          selectors.recentResultItem
        );

        recentResultLinks.forEach((link) => {
          expect(link.getAttribute('target')).toBe(customTarget);
        });
      });
    });

    describe('when the #isCollapsed property is false', () => {
      it('should display the card title, the collapse button icon and the recent results list', async () => {
        const collapseRecentResultsLabel = 'Collapse Recent results';
        const collapseRecentResultsIcon = 'utility:dash';
        const element = createTestComponent({
          ...defaultOptions,
          isCollapsed: false,
        });
        updateRecentResultsState();
        await flushPromises();

        const recentResultsContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentResultsContainer).not.toBeNull();
        expect(recentResultsContainer.title).toBe(defaultRecentResultsTitle);

        const toggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        expect(toggleButton).not.toBeNull();
        expect(toggleButton.alternativeText).toBe(collapseRecentResultsLabel);
        expect(toggleButton.iconName).toBe(collapseRecentResultsIcon);

        const recentResultsListItems = element.shadowRoot.querySelectorAll(
          selectors.recentResultItem
        );

        expect(recentResultsListItems.length).toBe(
          recentResultsListState.results.length
        );
      });
    });

    describe('when the #isCollapsed property is true', () => {
      it('should display the card title and the expand button icon but not the recent results list', async () => {
        const expandRecentResultsLabel = 'Expand Recent results';
        const expandRecentResultsIcon = 'utility:add';
        const element = createTestComponent({
          ...defaultOptions,
          isCollapsed: true,
        });
        updateRecentResultsState();
        await flushPromises();

        const recentResultsContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentResultsContainer).not.toBeNull();
        expect(recentResultsContainer.title).toBe(defaultRecentResultsTitle);

        const toggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        expect(toggleButton).not.toBeNull();
        expect(toggleButton.alternativeText).toBe(expandRecentResultsLabel);
        expect(toggleButton.iconName).toBe(expandRecentResultsIcon);

        const recentResultsListItems = element.shadowRoot.querySelectorAll(
          selectors.recentQueryItem
        );
        expect(recentResultsListItems[0]).toBeFalsy();
        expect(recentResultsListItems.length).toBe(0);
      });
    });
  });
});
