/* eslint-disable no-import-assign */
import QuanticResultList from 'c/quanticResultList';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultFieldsToInclude =
  'date,author,source,language,filetype,documenttype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid,sfparentid';

const defaultOptions = {
  engineId: exampleEngine.id,
};

const initialResultListState = {
  results: [],
  searchResponseId: 'foo',
  moreResultsAvailable: false,
};
let resultListState = initialResultListState;

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const selectors = {
  resultList: 'c-quantic-result-list',
  placeholder: 'c-quantic-placeholder',
  initializationError: 'c-quantic-component-error',
  quanticResult: 'c-quantic-result',
};

const initialResultsPerPageState = {
  numberOfResults: 0,
};
let resultsPerPageState = initialResultsPerPageState;

const functionsMocks = {
  buildResultList: jest.fn(() => ({
    state: resultListState,
    subscribe: functionsMocks.resultsListSubscriber,
    fetchMoreResults: functionsMocks.fetchMoreResults,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  buildResultsPerPage: jest.fn(() => ({
    state: resultsPerPageState,
    subscribe: functionsMocks.resultsPerPageSubscriber,
  })),
  buildResultTemplatesManager: jest.fn(),
  resultsListSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.resultListUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  resultsPerPageSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.resultsPerPageUnsubscriber;
  }),
  resultListUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  resultsPerPageUnsubscriber: jest.fn(),
  fetchMoreResults: jest.fn(),
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildResultList: functionsMocks.buildResultList,
      buildSearchStatus: functionsMocks.buildSearchStatus,
      buildResultsPerPage: functionsMocks.buildResultsPerPage,
      buildResultTemplatesManager: functionsMocks.buildResultTemplatesManager,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticResultList && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticResultList) {
      element.setInitializationError();
    }
  };
}

const createTestComponent = buildCreateTestComponent(
  QuanticResultList,
  'c-quantic-result-list',
  defaultOptions
);

describe('c-quantic-result-list', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    resultListState = initialResultListState;
    searchStatusState = initialSearchStatusState;
    resultsPerPageState = initialResultsPerPageState;
    isInitialized = false;
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should initialize the result list, search status, results per page, and result templates manager controllers with the correct engine and options', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildResultList).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultList).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            fieldsToInclude: defaultFieldsToInclude.split(','),
          },
        }
      );
      expect(functionsMocks.resultsListSubscriber).toHaveBeenCalledTimes(1);

      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );

      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.resultsPerPageSubscriber).toHaveBeenCalledTimes(1);

      expect(functionsMocks.buildResultTemplatesManager).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.buildResultTemplatesManager).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should emit the #quantic__registerresulttemplates custom event', async () => {
      const jestHandler = jest.fn();
      document.addEventListener(
        'quantic__registerresulttemplates',
        jestHandler
      );
      createTestComponent();
      await flushPromises();

      expect(jestHandler).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from the result list, searchStatus and resultPerPage controllers when the component is destroyed', async () => {
      const element = createTestComponent();
      await flushPromises();

      document.body.removeChild(element);
      await flushPromises();
      expect(functionsMocks.resultListUnsubscriber).toHaveBeenCalledTimes(1);
      expect(
        functionsMocks.searchStatusStateUnsubscriber
      ).toHaveBeenCalledTimes(1);
      expect(functionsMocks.resultsPerPageUnsubscriber).toHaveBeenCalledTimes(
        1
      );
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
  });

  describe('when the component is loading', () => {
    beforeEach(() => {
      searchStatusState = {
        ...initialSearchStatusState,
        isLoading: true,
        hasError: false,
        firstSearchExecuted: false,
      };
      resultsPerPageState = {
        ...initialResultsPerPageState,
        numberOfResults: 10,
      };
    });

    it('should display the loading placeholder', async () => {
      const element = createTestComponent();
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );

      expect(placeholder).not.toBeNull();
      expect(placeholder.numberOfRows).toBe(
        resultsPerPageState.numberOfResults
      );
    });

    describe('when the search status has an error', () => {
      beforeEach(() => {
        searchStatusState = {
          ...initialSearchStatusState,
          isLoading: true,
          hasError: true,
          firstSearchExecuted: false,
        };
      });

      it('should not display the loading placeholder', async () => {
        const element = createTestComponent();
        await flushPromises();

        const placeholder = element.shadowRoot.querySelector(
          selectors.placeholder
        );

        expect(placeholder).toBeNull();
      });
    });
  });

  describe('the #fieldsToInclude property', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should correctly send the fields to include to the headless controller', async () => {
      const fieldsToInclude = 'foo,bar,baz';
      createTestComponent({fieldsToInclude});
      await flushPromises();

      expect(functionsMocks.buildResultList).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            fieldsToInclude: fieldsToInclude.split(','),
          },
        }
      );
    });
  });

  describe('rendering results', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should render the results', async () => {
      const mockSearchResponseId = 'mockSearchResponseId';
      const fakeResults = [
        {
          uniqueId: 'foo',
          title: 'Foo',
          excerpt: 'Foo',
          raw: {
            foo: 'foo',
          },
        },
        {
          uniqueId: 'Bar',
          title: 'Bar',
          excerpt: 'Bar',
          raw: {
            foo: 'bar',
          },
        },
      ];
      resultListState = {
        ...initialResultListState,
        searchResponseId: mockSearchResponseId,
        results: fakeResults,
      };

      const element = createTestComponent();
      await flushPromises();

      const results = element.shadowRoot.querySelectorAll(
        selectors.quanticResult
      );
      expect(results.length).toBe(fakeResults.length);
      results.forEach((resultElement, index) => {
        expect(resultElement.engineId).toBe(exampleEngine.id);
        const fakeResult = fakeResults[index];
        expect(resultElement.result).toEqual({
          ...fakeResult,
          keyResultList: `${mockSearchResponseId}_${fakeResult.uniqueId}`,
        });
        expect(resultElement.resultTemplateManager).toEqual(
          functionsMocks.buildResultTemplatesManager()
        );
      });
    });
  });
});
