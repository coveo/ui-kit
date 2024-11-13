/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticCategoryFacet from 'c/quanticCategoryFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  Store: {
    facetTypes: {
      FACETS: 'facets',
      NUMERICFACETS: 'numericFacets',
      DATEFACETS: 'dateFacets',
      CATEGORYFACETS: 'categoryFacets',
    },
  },
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-test="facet-content"]',
};

const exampleFacetId = 'example facet id';
const defaultOptions = {
  field: 'example field',
};
const categoryFacetControllerMock = {
  subscribe: jest.fn((callback) => callback()),
  state: {
    facetId: exampleFacetId,
    values: [],
  },
};

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

  const element = createElement('c-quantic-category-facet', {
    is: QuanticCategoryFacet,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

const functionsMocks = {
  buildCategoryFacet: jest.fn(() => categoryFacetControllerMock),
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
      buildCategoryFacet: functionsMocks.buildCategoryFacet,
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
    if (element instanceof QuanticCategoryFacet && !isInitialized) {
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

describe('c-quantic-category-facet', () => {
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

      expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledTimes(1);
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
        [exampleFacetDependency.parentFacetId]:
          exampleFacetDependency.expectedValue,
      });
    });

    it('should not build the controller when the dependsOn property is not set', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledTimes(
        0
      );
      expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
    });
  });

  describe('the facet enablement', () => {
    describe('when the facet is enabled', () => {
      beforeAll(() => {
        functionsMocks.buildCategoryFacet.mockReturnValue({
          ...categoryFacetControllerMock,
          state: {...categoryFacetControllerMock.state, enabled: true},
        });
      });

      it('should display the facet content', async () => {
        const element = createTestComponent();
        await flushPromises();

        const facetContent = element.shadowRoot.querySelector(
          selectors.facetContent
        );
        expect(facetContent).not.toBeNull();
      });
    });

    describe('when the facet is not enabled', () => {
      beforeAll(() => {
        functionsMocks.buildCategoryFacet.mockReturnValue({
          ...categoryFacetControllerMock,
          state: {...categoryFacetControllerMock.state, enabled: false},
        });
      });

      it('should not display the facet content', async () => {
        const element = createTestComponent();
        await flushPromises();

        const facetContent = element.shadowRoot.querySelector(
          selectors.facetContent
        );
        expect(facetContent).toBeNull();
      });
    });

    afterAll(() => {
      functionsMocks.buildCategoryFacet.mockReturnValue(
        categoryFacetControllerMock
      );
    });
  });
});
