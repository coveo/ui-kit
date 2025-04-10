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
  I18nUtils: {
    format: jest.fn(),
  },
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-test="facet-content"]',
  componentError: 'c-quantic-component-error',
};

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const defaultOptions = {
  field: exampleField,
};
const categoryFacetControllerMock = {
  subscribe: jest.fn((callback) => callback()),
  state: {
    facetId: exampleFacetId,
    values: [],
  },
};
const parentFacetIdError = `The ${exampleField} c-quantic-category-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-category-facet requires dependsOn.expectedValue to be a valid string.`;

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
  stopWatching: jest.fn(),
  buildFacetConditionsManager: jest.fn(() => ({
    stopWatching: functionsMocks.stopWatching,
  })),
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

function mockBueno() {
  // @ts-ignore
  mockHeadlessLoader.getBueno = () => {
    // @ts-ignore
    global.Bueno = {
      isString: jest
        .fn()
        .mockImplementation(
          (value) => Object.prototype.toString.call(value) === '[object String]'
        ),
    };
    return new Promise((resolve) => resolve());
  };
}

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
    mockBueno();
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

  describe('validation of the dependsOn property', () => {
    let consoleError;
    beforeAll(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('when dependsOn.parentFacetId is not provided', () => {
      it('should display the error component', async () => {
        const invalidFacetDependency = {
          expectedValue: 'txt',
        };
        const element = createTestComponent({
          ...defaultOptions,
          dependsOn: invalidFacetDependency,
        });
        await flushPromises();

        const componentError = element.shadowRoot.querySelector(
          selectors.componentError
        );
        const facetContent = element.shadowRoot.querySelector(
          selectors.facetContent
        );

        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(parentFacetIdError);
        expect(componentError).not.toBeNull();
        expect(facetContent).toBeNull();
      });
    });

    describe('when dependsOn.parentFacetId is not a string', () => {
      it('should display the error component', async () => {
        const invalidFacetDependency = {
          parentFacetId: 1,
          expectedValue: 'txt',
        };
        const element = createTestComponent({
          ...defaultOptions,
          dependsOn: invalidFacetDependency,
        });
        await flushPromises();

        const componentError = element.shadowRoot.querySelector(
          selectors.componentError
        );
        const facetContent = element.shadowRoot.querySelector(
          selectors.facetContent
        );

        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(parentFacetIdError);
        expect(componentError).not.toBeNull();
        expect(facetContent).toBeNull();
      });
    });

    describe('when dependsOn.expectedValue is not a string', () => {
      it('should display the error component', async () => {
        const invalidFacetDependency = {
          parentFacetId: 'filetype',
          expectedValue: 2,
        };
        const element = createTestComponent({
          ...defaultOptions,
          dependsOn: invalidFacetDependency,
        });
        await flushPromises();

        const componentError = element.shadowRoot.querySelector(
          selectors.componentError
        );
        const facetContent = element.shadowRoot.querySelector(
          selectors.facetContent
        );

        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(expectedValueError);
        expect(componentError).not.toBeNull();
        expect(facetContent).toBeNull();
      });
    });
  });

  describe('when the component is disconnected', () => {
    it('should make the condition manager stop watching the facet', async () => {
      const exampleFacetDependency = {
        parentFacetId: 'filetype',
        expectedValue: 'txt',
      };
      const element = createTestComponent({
        ...defaultOptions,
        dependsOn: exampleFacetDependency,
      });
      await flushPromises();
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledTimes(
        1
      );

      document.body.removeChild(element);
      expect(functionsMocks.stopWatching).toHaveBeenCalledTimes(1);
    });
  });
});
