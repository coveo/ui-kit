/* eslint-disable no-import-assign */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticRefineModalContent from 'c/quanticRefineModalContent';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');

/** @type {{disableDynamicNavigation: boolean}} */
const defaultOptions = {
  disableDynamicNavigation: false,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-refine-modal-content', {
    is: QuanticRefineModalContent,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

const selectors = {
  quanticFacet: 'c-quantic-facet',
  quanticCategoryFacet: 'c-quantic-category-facet',
  quanticFacetCaption: 'c-quantic-facet-caption',
};

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const initialBreadcrumbManagerState = {};
let breadcrumbManagerState = initialBreadcrumbManagerState;

const functionsMocks = {
  buildBreadcrumbManager: jest.fn(() => ({
    state: breadcrumbManagerState,
    subscribe: functionsMocks.breadcrumbManagerStateSubscriber,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  breadcrumbManagerStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.breadcrumbManagerStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  breadcrumbManagerStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  retry: jest.fn(),
};

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const exampleEngine = {
  id: 'dummy engine',
};
let isInitialized = false;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildBreadcrumbManager: functionsMocks.buildBreadcrumbManager,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function prepareQuanticStore(facetData) {
  // @ts-ignore
  mockHeadlessLoader.getAllFacetsFromStore = () => {
    return facetData;
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRefineModalContent && !isInitialized) {
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

describe('c-quantic-refine-modal-content', () => {
  afterEach(() => {
    cleanup();
  });

  describe('when the dynamic navigation feature is enabled', () => {
    describe('when a standard facet is registered in the store', () => {
      const exampleFacetAttributes = {
        facetId: 'filetype',
        field: 'filetype',
        label: 'File Type',
        numberOfValues: '8',
        sortCriteria: 'occurrences',
        noSearch: 'true',
        displayValuesAs: 'link',
        noFilterFacetCount: 'false',
        injectionDepth: '1000',
        customSort: 'YouTubeVideo,PDF,HTML',
        dependsOn: '',
      };

      const exampleCaption = {
        value: 'YouTubeVideo',
        caption: 'YouTube Video',
      };

      beforeEach(() => {
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
        prepareQuanticStore({
          filetype: {
            label: 'File Type',
            facetId: 'filetype',
            element: {
              localName: 'c-quantic-facet',
              ...exampleFacetAttributes,
            },
            metadata: {
              customCaptions: [exampleCaption],
            },
          },
        });
      });

      it('should display the quantic facet with its custom captions and attributes', async () => {
        const element = createTestComponent();
        await flushPromises();

        const quanticFacet = element.shadowRoot.querySelector(
          selectors.quanticFacet
        );
        expect(quanticFacet).not.toBeNull();

        Object.entries(exampleFacetAttributes).forEach(([key, value]) => {
          expect(quanticFacet[key]).toBe(value);
        });

        const quanticFacetCaption = element.shadowRoot.querySelector(
          selectors.quanticFacetCaption
        );
        expect(quanticFacetCaption).not.toBeNull();
        expect(quanticFacetCaption.value).toBe(exampleCaption.value);
        expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
      });
    });

    describe('when a category facet is registered in the store', () => {
      const exampleCategoryFacetAttributes = {
        facetId: 'country',
        field: 'country',
        label: 'Country',
        basePath: 'North America',
        noFilterByBasePath: 'false',
        noFilterFacetCount: 'false',
        delimitingCharacter: '>',
        numberOfValues: '10',
        sortCriteria: 'alphanumeric',
        withSearch: 'true',
        dependsOn: '',
      };

      const exampleCaption = {
        value: 'Ca',
        caption: 'Canada',
      };

      beforeEach(() => {
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
        prepareQuanticStore({
          country: {
            label: 'Country',
            facetId: 'country',
            element: {
              localName: 'c-quantic-category-facet',
              ...exampleCategoryFacetAttributes,
            },
            metadata: {
              customCaptions: [exampleCaption],
            },
          },
        });
      });

      it('should display the quantic category facet with its custom captions and attributes', async () => {
        const element = createTestComponent();
        await flushPromises();

        const quanticCategoryFacet = element.shadowRoot.querySelector(
          selectors.quanticCategoryFacet
        );
        expect(quanticCategoryFacet).not.toBeNull();

        Object.entries(exampleCategoryFacetAttributes).forEach(
          ([key, value]) => {
            expect(quanticCategoryFacet[key]).toBe(value);
          }
        );

        const quanticFacetCaption = element.shadowRoot.querySelector(
          selectors.quanticFacetCaption
        );
        expect(quanticFacetCaption).not.toBeNull();
        expect(quanticFacetCaption.value).toBe(exampleCaption.value);
        expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
      });
    });
  });

  describe('when the dynamic navigation feature is disabled', () => {
    describe('when a standard facet is registered in the store', () => {
      const exampleFacetAttributes = {
        facetId: 'filetype',
        field: 'filetype',
        label: 'File Type',
        numberOfValues: '8',
        sortCriteria: 'occurrences',
        noSearch: 'true',
        displayValuesAs: 'link',
        noFilterFacetCount: 'false',
        injectionDepth: '1000',
        customSort: 'YouTubeVideo,PDF,HTML',
        dependsOn: '',
      };

      const exampleCaption = {
        value: 'YouTubeVideo',
        caption: 'YouTube Video',
      };

      beforeEach(() => {
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
        prepareQuanticStore({
          filetype: {
            label: 'File Type',
            facetId: 'filetype',
            element: {
              localName: 'c-quantic-facet',
              ...exampleFacetAttributes,
            },
            metadata: {
              customCaptions: [exampleCaption],
            },
          },
        });
      });

      it('should display the quantic facet with its custom captions and attributes', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          disableDynamicNavigation: true,
        });
        await flushPromises();

        const quanticFacet = element.shadowRoot.querySelector(
          selectors.quanticFacet
        );
        expect(quanticFacet).not.toBeNull();

        Object.entries(exampleFacetAttributes).forEach(([key, value]) => {
          expect(quanticFacet[key]).toBe(value);
        });

        const quanticFacetCaption = element.shadowRoot.querySelector(
          selectors.quanticFacetCaption
        );
        expect(quanticFacetCaption).not.toBeNull();
        expect(quanticFacetCaption.value).toBe(exampleCaption.value);
        expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
      });
    });

    describe('when a category facet is registered in the store', () => {
      const exampleCategoryFacetAttributes = {
        facetId: 'country',
        field: 'country',
        label: 'Country',
        basePath: 'North America',
        noFilterByBasePath: 'false',
        noFilterFacetCount: 'false',
        delimitingCharacter: '>',
        numberOfValues: '10',
        sortCriteria: 'alphanumeric',
        withSearch: 'true',
        dependsOn: '',
      };

      const exampleCaption = {
        value: 'Ca',
        caption: 'Canada',
      };

      beforeEach(() => {
        mockSuccessfulHeadlessInitialization();
        prepareHeadlessState();
        prepareQuanticStore({
          country: {
            label: 'Country',
            facetId: 'country',
            element: {
              localName: 'c-quantic-category-facet',
              ...exampleCategoryFacetAttributes,
            },
            metadata: {
              customCaptions: [exampleCaption],
            },
          },
        });
      });

      it('should display the quantic category facet with its custom captions and attributes', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          disableDynamicNavigation: true,
        });
        await flushPromises();

        const quanticCategoryFacet = element.shadowRoot.querySelector(
          selectors.quanticCategoryFacet
        );
        expect(quanticCategoryFacet).not.toBeNull();

        Object.entries(exampleCategoryFacetAttributes).forEach(
          ([key, value]) => {
            expect(quanticCategoryFacet[key]).toBe(value);
          }
        );

        const quanticFacetCaption = element.shadowRoot.querySelector(
          selectors.quanticFacetCaption
        );
        expect(quanticFacetCaption).not.toBeNull();
        expect(quanticFacetCaption.value).toBe(exampleCaption.value);
        expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
      });
    });
  });
});
