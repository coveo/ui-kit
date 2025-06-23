/* eslint-disable no-import-assign */
import QuanticFoldedResultList from 'c/quanticFoldedResultList';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

const labels = {
  loadingResults: 'Loading results...',
};

jest.mock(
  '@salesforce/label/c.quantic_LoadingResults',
  () => ({default: labels.loadingResults}),
  {virtual: true}
);

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
  I18nUtils: {
    format: jest.fn(),
  },
}));

const mockSearchResponseId = 'mockSearchResponseId';
const fakeCollections = [
  {
    result: {
      uniqueId: 'foo',
      title: 'Foo',
      excerpt: 'Foo',
      raw: {
        foo: 'foo',
      },
    },
    children: [
      {
        result: {
          uniqueId: 'Baz',
          title: 'Baz',
          excerpt: 'Baz',
          raw: {
            foo: 'baz',
          },
        },
        children: [],
      },
    ],
  },
  {
    result: {
      uniqueId: 'Bar',
      title: 'Bar',
      excerpt: 'Bar',
      raw: {
        foo: 'bar',
      },
    },
    children: [],
  },
];

let isInitialized = false;

const defaultOptions = {
  engineId: 'testEngine',
  collectionField: 'foldingcollection',
  parentField: 'foldingparent',
  childField: 'foldingchild',
  numberOfFoldedResults: 2,
};

const initialFoldedResultListState = {};
let foldedResultsListState = initialFoldedResultListState;
const initialResultsPerPageState = {
  numberOfResults: 10,
};
let resultsPerPageState = initialResultsPerPageState;

const functionsMocks = {
  buildFoldedResultList: jest.fn(() => ({
    subscribe: functionsMocks.subscribeFoldedResultList,
    state: foldedResultsListState,
  })),
  subscribeFoldedResultList: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeFoldedResultList;
  }),
  unsubscribeFoldedResultList: jest.fn(),
  buildResultsPerPage: jest.fn(() => ({
    subscribe: functionsMocks.subscribeResultsPerPage,
    state: resultsPerPageState,
  })),
  subscribeResultsPerPage: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeResultsPerPage;
  }),
  unsubscribeResultsPerPage: jest.fn(),
  buildResultTemplatesManager: jest.fn(),
};

const selectors = {
  placeholder: 'c-quantic-placeholder',
  result: 'c-quantic-result',
  error: 'c-quantic-component-error',
};

const exampleEngine = {
  id: defaultOptions.engineId,
};

const createTestComponent = buildCreateTestComponent(
  QuanticFoldedResultList,
  'c-quantic-folded-result-list',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildFoldedResultList: functionsMocks.buildFoldedResultList,
      buildResultsPerPage: functionsMocks.buildResultsPerPage,
      buildResultTemplatesManager: functionsMocks.buildResultTemplatesManager,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticFoldedResultList && !isInitialized) {
      isInitialized = true;
      initialize({
        id: defaultOptions.engineId,
      });
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticFoldedResultList) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-folded-result-list', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });
  afterEach(() => {
    cleanup();
    foldedResultsListState = initialFoldedResultListState;
    resultsPerPageState = initialResultsPerPageState;
    isInitialized = false;
    jest.clearAllMocks();
  });

  describe('when the component is loading', () => {
    beforeEach(() => {
      foldedResultsListState = {
        isLoading: true,
        hasError: false,
        firstSearchExecuted: false,
        hasResults: false,
      };
    });

    it('should render placeholders', async () => {
      const element = createTestComponent();
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );
      expect(placeholder).not.toBeNull();
    });
  });

  describe('component initialization', () => {
    describe('when an initialization error occurs', () => {
      beforeEach(() => {
        mockErroneousHeadlessInitialization();
      });

      it('should display the initialization error component', async () => {
        const element = createTestComponent();
        await flushPromises();
        const errorComponent = element.shadowRoot.querySelector(
          selectors.error
        );
        expect(errorComponent).not.toBeNull();
      });
    });

    describe('successful initialization', () => {
      it('should build the folded result list, the results per page and the template manager controllers, and subscribe to state changes', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildFoldedResultList).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildFoldedResultList).toHaveBeenCalledWith(
          exampleEngine,
          {
            options: {
              fieldsToInclude:
                'date,author,source,language,filetype,documenttype,parents,sfknowledgearticleid,sfid,sfkbid,sfkavid,sfparentid'.split(
                  ','
                ),
              folding: {
                numberOfFoldedResults: 2,
                childField: 'foldingchild',
                parentField: 'foldingparent',
                collectionField: 'foldingcollection',
              },
            },
          }
        );
        expect(functionsMocks.subscribeFoldedResultList).toHaveBeenCalledTimes(
          1
        );
        expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildResultsPerPage).toHaveBeenCalledWith(
          exampleEngine
        );
        expect(functionsMocks.subscribeResultsPerPage).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildResultTemplatesManager
        ).toHaveBeenCalledTimes(1);
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
    });

    describe('with custom options', () => {
      it('should initialize the folded result list with custom options', async () => {
        const customOptions = {
          collectionField: 'customCollectionField',
          parentField: 'customParentField',
          childField: 'customChildField',
          numberOfFoldedResults: 5,
        };
        createTestComponent(customOptions);
        await flushPromises();

        expect(functionsMocks.buildFoldedResultList).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({
              folding: expect.objectContaining({
                numberOfFoldedResults: customOptions.numberOfFoldedResults,
                childField: customOptions.childField,
                parentField: customOptions.parentField,
                collectionField: customOptions.collectionField,
              }),
            }),
          })
        );
      });
    });
  });

  describe('results rendering', () => {
    beforeEach(() => {
      foldedResultsListState = {
        isLoading: false,
        hasError: false,
        firstSearchExecuted: true,
        hasResults: true,
        results: fakeCollections,
        searchResponseId: mockSearchResponseId,
      };
    });
    it('should not render placeholders when state has results', async () => {
      const element = createTestComponent();
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );
      expect(placeholder).toBeNull();
    });

    it('should render results when state has results', async () => {
      const element = createTestComponent();
      await flushPromises();

      const results = element.shadowRoot.querySelectorAll(selectors.result);
      expect(results.length).toBe(fakeCollections.length);
      results.forEach((resultElement, index) => {
        const collection = fakeCollections[index];
        expect(resultElement.engineId).toBe(exampleEngine.id);
        expect(resultElement.collection).toEqual({
          ...collection,
          keyResultList: `${mockSearchResponseId}_${collection.result.uniqueId}`,
        });
        expect(resultElement.result).toEqual(collection.result);
        expect(resultElement.resultTemplateManager).toEqual(
          functionsMocks.buildResultTemplatesManager()
        );
      });
      expect(results[0].getAttribute('result')).toBeDefined();
    });
  });
});
