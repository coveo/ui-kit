/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticTimeframeFacet from 'c/quanticTimeframeFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  Store: {
    facetTypes: {
      DATEFACETS: 'dateFacets',
    },
  },
}));
jest.mock('c/quanticHeadlessLoader');

const exampleFacetId = 'example facet id';
const defaultOptions = {
  field: 'example field',
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-timeframe-facet', {
    is: QuanticTimeframeFacet,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

const functionsMocks = {
  buildDateFacet: jest.fn(() => ({
    subscribe: jest.fn((callback) => callback()),
    state: {
      facetId: exampleFacetId,
      values: [],
    },
  })),
  buildDateFilter: jest.fn(() => ({
    subscribe: jest.fn((callback) => callback()),
    state: {},
  })),
  buildFacetConditionsManager: jest.fn(),
  buildSearchStatus: jest.fn(() => ({
    subscribe: jest.fn((callback) => callback()),
    state: {},
  })),
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildDateFacet: functionsMocks.buildDateFacet,
      buildDateFilter: functionsMocks.buildDateFilter,
      buildSearchStatus: functionsMocks.buildSearchStatus,
      buildFacetConditionsManager: functionsMocks.buildFacetConditionsManager,
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const exampleEngine = {
  id: 'dummy engine',
};
let isInitialized = false;

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticTimeframeFacet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
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

describe('c-quantic-timeframe-facet', () => {
  beforeAll(() => {
    mockSuccessfulHeadlessInitialization();
  });

  afterEach(() => {
    cleanup();
  });

  describe('the facet conditions manager', () => {
    it('should build the controller when the dependsOn property is set', async () => {
      const exampleFacetDependency = {
        parentFacetId: 'filetype',
        expectedValue: 'txt',
      };
      createTestComponent({
        ...defaultOptions,
        dependsOn: exampleFacetDependency,
      });
      await flushPromises();

      expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledTimes(
        1
      );
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledWith(
        exampleEngine,
        {
          facetId: exampleFacetId,
        }
      );

      expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(1);
      expect(generateFacetDependencyConditions).toHaveBeenCalledWith({
        filetype: 'txt',
      });
    });

    it('should not build the controller when the dependsOn property is not set', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledTimes(
        0
      );
      expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
    });
  });
});
