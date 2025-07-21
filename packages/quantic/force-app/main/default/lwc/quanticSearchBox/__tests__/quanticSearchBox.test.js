/* eslint-disable no-import-assign */
import QuanticSearchBox from 'c/quanticSearchBox';
// @ts-ignore
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;
const initialSearchBoxState = {
  value: '',
  suggestions: [],
  isLoading: false,
  searchBoxId: 'searchBoxId',
};

let searchBoxState = initialSearchBoxState;

const initialRecentQueriesState = {
  queries: [],
};

let recentQueriesState = initialRecentQueriesState;

const functionsMocks = {
  buildSearchBox: jest.fn(() => ({
    state: searchBoxState,
    subscribe: functionsMocks.searchBoxSubscriber,
    submit: functionsMocks.submit,
    updateText: functionsMocks.updateText,
    showSuggestions: functionsMocks.showSuggestions,
    selectSuggestion: functionsMocks.selectSuggestion,
  })),
  buildRecentQueriesList: jest.fn(() => ({
    state: recentQueriesState,
    subscribe: functionsMocks.recentQueriesSubscriber,
    clear: functionsMocks.clearRecentQueries,
    executeRecentQuery: functionsMocks.executeRecentQuery,
  })),

  loadQuerySuggestActions: jest.fn(() => ({
    clearQuerySuggest: functionsMocks.clearQuerySuggest,
  })),
  searchBoxSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  recentQueriesSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  dispatch: jest.fn(() => {}),
  clearQuerySuggest: jest.fn((id) => {
    return {
      id,
    };
  }),
  submit: jest.fn(() => {}),
  updateText: jest.fn((newValue) => newValue),
  showSuggestions: jest.fn(() => {}),
  selectSuggestion: jest.fn((selectedSuggestion) => selectedSuggestion),
  clearRecentQueries: jest.fn(() => {}),
  executeRecentQuery: jest.fn((index) => index),
};

const exampleEngine = {
  id: 'exampleEngineId',
  dispatch: functionsMocks.dispatch,
};

const defaultOptions = {
  engineId: exampleEngine.id,
  placeholder: 'Search',
  withoutSubmitButton: false,
  numberOfSuggestions: 7,
  textarea: false,
  disableRecentQueries: false,
  keepFiltersOnSearch: false,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  searchBoxInput: 'c-quantic-search-box-input',
};

const createTestComponent = buildCreateTestComponent(
  QuanticSearchBox,
  'c-quantic-search-box',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildSearchBox: functionsMocks.buildSearchBox,
      buildRecentQueriesList: functionsMocks.buildRecentQueriesList,
      loadQuerySuggestActions: functionsMocks.loadQuerySuggestActions,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticSearchBox && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticSearchBox) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-search-box', () => {
  afterEach(() => {
    cleanup();
    isInitialized = false;
    searchBoxState = initialSearchBoxState;
    recentQueriesState = initialRecentQueriesState;
  });

  describe('controller initialization', () => {
    beforeAll(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the searchbox controller with the proper parameters and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfSuggestions: 7,
            highlightOptions: {
              notMatchDelimiters: {
                open: '<b>',
                close: '</b>',
              },
            },
            clearFilters: true,
          }),
        })
      );
      expect(functionsMocks.searchBoxSubscriber).toHaveBeenCalledTimes(1);
    });

    it('should build the recent queries controller with the right maxLength value and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            maxLength: 20,
          }),
        })
      );
      expect(functionsMocks.recentQueriesSubscriber).toHaveBeenCalledTimes(1);
    });

    it('should properly load query suggest actions', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.loadQuerySuggestActions).toHaveBeenCalledTimes(1);
      expect(functionsMocks.loadQuerySuggestActions).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    describe('the #keepFiltersOnSearch property', () => {
      it('should build the controllers with clear filters enabled when keepFiltersOnSearch is false (default)', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: true}),
          })
        );
        expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: true}),
          })
        );
      });

      it('should build the controllers with clear filters disabled when keepFiltersOnSearch is true', async () => {
        createTestComponent({
          ...defaultOptions,
          keepFiltersOnSearch: true,
        });
        await flushPromises();

        expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: false}),
          })
        );
        expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildRecentQueriesList).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({clearFilters: false}),
          })
        );
      });
    });

    describe('when the #disableRecentQueries property is true', () => {
      it('should not build the recent queries controller', async () => {
        createTestComponent({
          ...defaultOptions,
          disableRecentQueries: true,
        });
        await flushPromises();

        expect(functionsMocks.buildRecentQueriesList).not.toHaveBeenCalled();
      });
    });

    describe('with a custom #numberOfSuggestions value', () => {
      it('should build the searchbox controller with the custom number of suggestions', async () => {
        const customNumberOfSuggestions = 10;
        createTestComponent({
          ...defaultOptions,
          numberOfSuggestions: customNumberOfSuggestions,
        });
        await flushPromises();

        expect(functionsMocks.buildSearchBox).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildSearchBox).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({
              numberOfSuggestions: customNumberOfSuggestions,
            }),
          })
        );
      });
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
    beforeAll(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should not display the error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );
      expect(initializationError).toBeNull();
    });

    it('should render the searchbox input with the default options', async () => {
      const element = createTestComponent();
      await flushPromises();

      const searchBoxInput = element.shadowRoot.querySelector(
        selectors.searchBoxInput
      );

      expect(searchBoxInput).not.toBeNull();
      expect(searchBoxInput.inputValue).toBe('');
      expect(searchBoxInput.textarea).toBe(defaultOptions.textarea);
      expect(searchBoxInput.withoutSubmitButton).toBe(
        defaultOptions.withoutSubmitButton
      );
      expect(searchBoxInput.placeholder).toBe(defaultOptions.placeholder);
      expect(searchBoxInput.maxNumberOfSuggestions).toBe(
        defaultOptions.numberOfSuggestions
      );
    });

    describe('event handling', () => {
      it('should call the #submit controller function when receiving a #quantic__submitsearch event', async () => {
        const element = createTestComponent();
        await flushPromises();

        const searchBoxInput = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );

        searchBoxInput.dispatchEvent(
          new CustomEvent('quantic__submitsearch', {
            bubbles: true,
            composed: true,
          })
        );

        expect(functionsMocks.submit).toHaveBeenCalledTimes(1);
      });

      describe('when receiving a #quantic__inputvaluechange event', () => {
        it('should call the #updateText controller function with a new value', async () => {
          const element = createTestComponent();
          await flushPromises();

          const searchBoxInput = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );

          searchBoxInput.dispatchEvent(
            new CustomEvent('quantic__inputvaluechange', {
              bubbles: true,
              composed: true,
              detail: {value: 'new value'},
            })
          );

          expect(functionsMocks.updateText).toHaveBeenCalledTimes(1);
          expect(functionsMocks.updateText).toHaveBeenCalledWith('new value');
        });

        it('should not call the #updateText controller function with the same value', async () => {
          const sameValue = 'same value';
          searchBoxState.value = sameValue;
          const element = createTestComponent();
          await flushPromises();

          const searchBoxInput = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );

          searchBoxInput.dispatchEvent(
            new CustomEvent('quantic__inputvaluechange', {
              bubbles: true,
              composed: true,
              detail: {value: sameValue},
            })
          );

          expect(functionsMocks.updateText).not.toHaveBeenCalledTimes(1);
          expect(functionsMocks.updateText).not.toHaveBeenCalledWith(sameValue);
        });
      });

      it('should call the #showSuggestions controller function when receiving a #quantic__showsuggestions event', async () => {
        const element = createTestComponent();
        await flushPromises();

        const searchBoxInput = element.shadowRoot.querySelector(
          selectors.searchBoxInput
        );

        searchBoxInput.dispatchEvent(
          new CustomEvent('quantic__showsuggestions', {
            bubbles: true,
            composed: true,
          })
        );

        expect(functionsMocks.showSuggestions).toHaveBeenCalledTimes(1);
      });

      describe('when receiving a #quantic__selectsuggestion event', () => {
        it('should call the #selectSuggestion controller function when a suggestion is clicked', async () => {
          const selectedSuggestion = {
            rawValue: 'selected value',
            highlightedValue: 'selected value',
          };
          const element = createTestComponent();
          await flushPromises();

          const searchBoxInput = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );

          searchBoxInput.dispatchEvent(
            new CustomEvent('quantic__selectsuggestion', {
              bubbles: true,
              composed: true,
              detail: {selectedSuggestion: {value: selectedSuggestion}},
            })
          );

          expect(functionsMocks.selectSuggestion).toHaveBeenCalledTimes(1);
          expect(functionsMocks.selectSuggestion).toHaveBeenCalledWith(
            selectedSuggestion
          );
        });

        it('should call the #clear controller function when #isClearRecentQueryButton is true', async () => {
          const element = createTestComponent();
          await flushPromises();

          const searchBoxInput = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );

          searchBoxInput.dispatchEvent(
            new CustomEvent('quantic__selectsuggestion', {
              bubbles: true,
              composed: true,
              detail: {
                selectedSuggestion: {value: {}, isClearRecentQueryButton: true},
              },
            })
          );

          expect(functionsMocks.clearRecentQueries).toHaveBeenCalledTimes(1);
        });

        it('should call the #executeRecentQuery controller function when #isRecentQuery is true and dispatch a #clearQuerySuggest action', async () => {
          recentQueriesState = {
            queries: [
              {rawValue: 'query 1', highlightedValue: 'query 1'},
              {rawValue: 'query 2', highlightedValue: 'query 2'},
            ],
          };
          const selectedRecentQuery = recentQueriesState.queries[0];
          const element = createTestComponent();
          await flushPromises();

          const searchBoxInput = element.shadowRoot.querySelector(
            selectors.searchBoxInput
          );

          searchBoxInput.dispatchEvent(
            new CustomEvent('quantic__selectsuggestion', {
              bubbles: true,
              composed: true,
              detail: {
                selectedSuggestion: {
                  value: selectedRecentQuery,
                  isRecentQuery: true,
                },
              },
            })
          );

          expect(functionsMocks.executeRecentQuery).toHaveBeenCalledTimes(1);
          expect(functionsMocks.executeRecentQuery).toHaveBeenCalledWith(0);
          expect(functionsMocks.clearQuerySuggest).toHaveBeenCalledTimes(1);
          expect(functionsMocks.clearQuerySuggest).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'searchBoxId',
            })
          );
        });
      });
    });
  });
});
