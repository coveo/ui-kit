/* eslint-disable no-import-assign */
import QuanticRecentQueriesList from 'c/quanticRecentQueriesList';
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import * as utils from 'c/quanticUtils';

const exampleEngine = {
  id: 'exampleEngineId',
};
const localStorageKey = `${exampleEngine.id}_quantic-recent-queries`;

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_RecentQueries',
  () => ({default: 'Recent Queries'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_EmptyRecentQueriesListLabel',
  () => ({default: 'Your recent searches will appear here.'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_Expand',
  () => ({default: 'Expand Recent queries'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_Collapse',
  () => ({default: 'Collapse Recent queries'}),
  {
    virtual: true,
  }
);

const defaultRecentQueriesTitle = 'Recent Queries';
const defaultQueries = [];
const defaultMaxLength = 10;
let isInitialized = false;
let updateRecentQueriesState;

const initialRecentQueriesListState = {
  queries: defaultQueries,
  maxLength: defaultMaxLength,
};
let recentQueriesListState = initialRecentQueriesListState;

const functionMocks = {
  buildRecentQueriesList: jest.fn(() => ({
    state: recentQueriesListState,
    subscribe: functionMocks.recentQueriesListSubscriber,
    executeRecentQuery: functionMocks.executeRecentQuery,
    clear: functionMocks.clear,
    updateRecentQueries: functionMocks.updateRecentQueries,
  })),
  recentQueriesListSubscriber: jest.fn((callback) => {
    updateRecentQueriesState = async () => {
      callback();
      await flushPromises();
    };
    return () => {};
  }),
  recentQueriesListUnsubscriber: jest.fn(),
  executeRecentQuery: jest.fn(),
  clear: jest.fn(),
  updateRecentQueries: jest.fn(),
};

const defaultOptions = {
  engineId: exampleEngine.id,
  label: 'Recent Queries',
  hideWhenEmpty: false,
  isCollapsed: false,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  quanticCardContainer: 'c-quantic-card-container',
  recentQueryItem: '[data-testid="recent-query-item"]',
  recentQueryItemText: '[data-testid="recent-query-text"]',
  toggleButton: '[data-testid="action-button"]',
};

const createTestComponent = buildCreateTestComponent(
  QuanticRecentQueriesList,
  'c-quantic-recent-queries-list',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildRecentQueriesList: functionMocks.buildRecentQueriesList,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRecentQueriesList && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticRecentQueriesList) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-recent-queries-list', () => {
  afterEach(() => {
    cleanup();
    recentQueriesListState = initialRecentQueriesListState;
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

    it('should build the controller with the proper parameters and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
      expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledWith(
        exampleEngine,
        {
          initialState: {queries: defaultQueries},
          options: expect.objectContaining({
            maxLength: defaultMaxLength,
          }),
        }
      );
      expect(functionMocks.recentQueriesListSubscriber).toHaveBeenCalledTimes(
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
    });

    describe('the #hideWhenEmpty property', () => {
      describe('when there are no recent queries', () => {
        beforeEach(() => {
          recentQueriesListState = {
            ...recentQueriesListState,
            queries: [],
          };
        });

        it('should display an empty list when it is set to false', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            hideWhenEmpty: false,
          });
          updateRecentQueriesState();
          await flushPromises();

          const recentQueriesContainer = element.shadowRoot.querySelector(
            selectors.quanticCardContainer
          );
          expect(recentQueriesContainer).not.toBeNull();
          expect(recentQueriesContainer.title).toEqual(
            defaultRecentQueriesTitle
          );

          const recentQueriesListItems = element.shadowRoot.querySelectorAll(
            selectors.recentQueryItem
          );
          expect(recentQueriesListItems.length).toEqual(0);
        });

        it('should not display the recent queries card when it is set to true', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            hideWhenEmpty: true,
          });
          await flushPromises();

          const recentQueriesContainer = element.shadowRoot.querySelector(
            selectors.quanticCardContainer
          );
          expect(recentQueriesContainer).toBeNull();
        });
      });
    });

    describe('when there are recent queries', () => {
      const exampleQueries = ['query1', 'query2'];

      it('should no longer display the placeholder component', async () => {
        const element = createTestComponent();
        recentQueriesListState = {
          queries: exampleQueries,
          maxLength: defaultMaxLength,
        };
        updateRecentQueriesState();
        await flushPromises();

        const placeholder = element.shadowRoot.querySelector(
          selectors.placeholder
        );

        expect(placeholder).toBeNull();
      });

      it('should display the recent queries list with the default options', async () => {
        recentQueriesListState = {
          queries: exampleQueries,
          maxLength: defaultMaxLength,
        };
        const element = createTestComponent();
        updateRecentQueriesState();
        await flushPromises();

        const recentQueriesContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentQueriesContainer).not.toBeNull();
        expect(recentQueriesContainer.title).toEqual(defaultRecentQueriesTitle);

        const recentQueriesListItems = element.shadowRoot.querySelectorAll(
          selectors.recentQueryItem
        );
        expect(recentQueriesListItems.length).toEqual(exampleQueries.length);

        recentQueriesListItems.forEach((item, index) => {
          const recentQueryText = item.querySelector(
            selectors.recentQueryItemText
          ).textContent;
          expect(recentQueryText).toEqual(exampleQueries[index]);
        });
      });

      it('should use the correct initial state retrieved from the localstorage', async () => {
        const exampleRecentQueries = ['query1', 'query2'];
        const getItemFromLocalStorageSpy = jest
          .spyOn(utils, 'getItemFromLocalStorage')
          .mockReturnValue(exampleRecentQueries);
        createTestComponent();
        await flushPromises();

        expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
        expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledWith(
          exampleEngine,
          {
            initialState: {queries: exampleRecentQueries},
            options: {maxLength: defaultMaxLength},
          }
        );

        expect(getItemFromLocalStorageSpy).toHaveBeenCalledWith(
          localStorageKey
        );
        expect(getItemFromLocalStorageSpy).toHaveBeenCalledTimes(1);
      });

      it('should call #setItemInLocalStorage function with the proper parameters when the recent queries change in the state', async () => {
        const setItemInLocalStorageSpy = jest.spyOn(
          utils,
          'setItemInLocalStorage'
        );
        createTestComponent();
        recentQueriesListState.queries = exampleQueries;
        updateRecentQueriesState();
        await flushPromises();

        recentQueriesListState = {
          queries: exampleQueries,
          maxLength: defaultMaxLength,
        };

        expect(setItemInLocalStorageSpy).toHaveBeenCalledWith(
          localStorageKey,
          exampleQueries
        );
        expect(setItemInLocalStorageSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('with a custom #maxLength value', () => {
      it('should set the #maxLength value in the controller', async () => {
        const exampleQueries = ['query1', 'query2'];
        const customMaxLength = 5;
        createTestComponent({...defaultOptions, maxLength: customMaxLength});
        await flushPromises();

        expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
        expect(functionMocks.buildRecentQueriesList).toHaveBeenCalledWith(
          exampleEngine,
          {
            initialState: {queries: exampleQueries},
            options: {maxLength: customMaxLength},
          }
        );
      });
    });

    describe('with a custom #label value', () => {
      it('should display the custom label in the title of the component', async () => {
        const customLabel = 'My Custom Label';
        const element = createTestComponent({
          ...defaultOptions,
          label: customLabel,
        });
        updateRecentQueriesState();
        await flushPromises();

        const recentQueriesContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentQueriesContainer).not.toBeNull();
        expect(recentQueriesContainer.title).toEqual(customLabel);
      });
    });

    describe('when the #isCollapsed property is true', () => {
      it('should display the card title and the expand button icon but not the recent queries list', async () => {
        const expandRecentQueriesLabel = 'Expand Recent queries';
        const expandRecentQueriesIcon = 'utility:add';
        const element = createTestComponent({
          ...defaultOptions,
          isCollapsed: true,
        });
        updateRecentQueriesState();
        await flushPromises();

        const recentQueriesContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentQueriesContainer).not.toBeNull();
        expect(recentQueriesContainer.title).toEqual(defaultRecentQueriesTitle);

        const toggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        expect(toggleButton).not.toBeNull();
        expect(toggleButton.alternativeText).toEqual(expandRecentQueriesLabel);
        expect(toggleButton.iconName).toEqual(expandRecentQueriesIcon);

        const recentQueriesListItems = element.shadowRoot.querySelectorAll(
          selectors.recentQueryItem
        );
        expect(recentQueriesListItems[0]).toBeFalsy();
        expect(recentQueriesListItems.length).toEqual(0);
      });
    });

    describe('when the #isCollapsed property is false', () => {
      it('should display the card title, the collapse button icon and the recent queries list', async () => {
        const collapseRecentQueriesLabel = 'Collapse Recent queries';
        const collapseRecentQueriesIcon = 'utility:dash';
        const element = createTestComponent({
          ...defaultOptions,
          isCollapsed: false,
        });
        updateRecentQueriesState();
        await flushPromises();

        const recentQueriesContainer = element.shadowRoot.querySelector(
          selectors.quanticCardContainer
        );
        expect(recentQueriesContainer).not.toBeNull();
        expect(recentQueriesContainer.title).toEqual(defaultRecentQueriesTitle);

        const toggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        expect(toggleButton).not.toBeNull();
        expect(toggleButton.alternativeText).toEqual(
          collapseRecentQueriesLabel
        );
        expect(toggleButton.iconName).toEqual(collapseRecentQueriesIcon);

        const recentQueriesListItems = element.shadowRoot.querySelectorAll(
          selectors.recentQueryItem
        );

        expect(recentQueriesListItems.length).toEqual(
          recentQueriesListState.queries.length
        );
        recentQueriesListItems.forEach((item, index) => {
          const recentQueryText = item.querySelector(
            selectors.recentQueryItemText
          ).textContent;
          expect(recentQueryText).toEqual(
            recentQueriesListState.queries[index]
          );
        });
      });
    });
  });
});
