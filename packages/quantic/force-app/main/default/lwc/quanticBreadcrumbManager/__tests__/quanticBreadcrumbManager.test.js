/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticBreadcrumbManager from 'c/quanticBreadcrumbManager';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

const initialBreadcrumbManagerState = {
  hasBreadcrumbs: false,
  numericFacetBreadcrumbs: [],
  categoryFacetBreadcrumbs: [],
  dateFacetBreadcrumbs: [],
  facetBreadcrumbs: [],
};
let breadcrumbManagerState = initialBreadcrumbManagerState;

const initialStoreState = {};
let storeState = initialStoreState;

const functionsMocks = {
  buildBreadcrumbManager: jest.fn(() => ({
    state: breadcrumbManagerState,
    subscribe: functionsMocks.subscribe,
  })),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

const selectors = {
  facetBreadcrumb: '[data-test="facet-breadcrumb"]',
  facetBreadcrumbValue: '[data-test="facet-breadcrumb-value"]',
  categoryFacetBreadcrumb: '[data-test="category-facet-breadcrumb"]',
  categoryFacetBreadcrumbValue: '[data-test="category-facet-breadcrumb-value"]',
  numericFacetBreadcrumb: '[data-test="numeric-facet-breadcrumb"]',
  numericFacetBreadcrumbValue: '[data-test="numeric-facet-breadcrumb-value"]',
  dateFacetBreadcrumb: '[data-test="date-facet-breadcrumb"]',
  dateFacetBreadcrumbValue: '[data-test="date-facet-breadcrumb-value"]',
};

const exampleEngine = {
  id: 'dummy engine',
};
const exampleFacetId = 'idOne';

let isInitialized = false;

function createTestComponent(options = {}) {
  const element = createElement('c-quantic-breadcrumb-manager', {
    is: QuanticBreadcrumbManager,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildBreadcrumbManager: functionsMocks.buildBreadcrumbManager,
    };
  };
}

function mockStoreState() {
  // @ts-ignore
  mockHeadlessLoader.getFromStore = () => {
    return storeState;
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticBreadcrumbManager && !isInitialized) {
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

describe('c-quantic-breadcrumb-manager', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
    mockStoreState();
  });

  afterEach(() => {
    breadcrumbManagerState = initialBreadcrumbManagerState;
    storeState = initialStoreState;
    cleanup();
  });

  describe('facet breadcrumbs', () => {
    const exampleFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: exampleFacetId,
        values: [{value: 'one'}, {value: 'two'}],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        facetBreadcrumbs: exampleFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };

      storeState = {
        [exampleFacetId]: {
          facetId: exampleFacetId,
          format: (value) => value,
        },
      };
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const facetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.facetBreadcrumb
      );

      expect(facetBreadcrumbs.length).toBe(exampleFacetBreadcrumbs.length);
      facetBreadcrumbs.forEach((facetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = exampleFacetBreadcrumbs[index];
        const facetBreadcrumbValues = Array.from(
          facetBreadcrumb.querySelectorAll(selectors.facetBreadcrumbValue)
        );

        expect(facetBreadcrumbValues.length).toBe(
          exampleFacetBreadcrumb.values.length
        );

        const labels = facetBreadcrumbValues.map(
          (facetBreadcrumbValue) => facetBreadcrumbValue.label
        );
        const values = exampleFacetBreadcrumb.values.map((item) => item.value);
        expect(labels).toEqual(values);
      });
    });
  });

  describe('category facet breadcrumbs', () => {
    const exampleCategoryFacetBreadcrumbs = [
      {
        field: exampleFacetId,
        facetId: exampleFacetId,
        path: [{value: 'one'}, {value: 'two'}],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        categoryFacetBreadcrumbs: exampleCategoryFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };

      storeState = {
        [exampleFacetId]: {
          facetId: exampleFacetId,
          format: (item) => item.value,
        },
      };
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const categoryFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.categoryFacetBreadcrumb
      );

      expect(categoryFacetBreadcrumbs.length).toBe(
        exampleCategoryFacetBreadcrumbs.length
      );
      categoryFacetBreadcrumbs.forEach((categoryFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = exampleCategoryFacetBreadcrumbs[index];
        const categoryFacetBreadcrumbValues = Array.from(
          categoryFacetBreadcrumb.querySelectorAll(
            selectors.categoryFacetBreadcrumbValue
          )
        );

        expect(categoryFacetBreadcrumbValues.length).toBe(1);

        const labels = categoryFacetBreadcrumbValues.map(
          (facetBreadcrumbValue) => facetBreadcrumbValue.label
        );
        const values = exampleFacetBreadcrumb.path.map((item) => item.value);
        expect(labels).toEqual([values.join(' / ')]);
      });
    });
  });

  describe('numeric facet breadcrumbs', () => {
    const exampleNumericFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: exampleFacetId,
        values: [{value: {start: 0, end: 1}}, {value: {start: 1, end: 2}}],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        numericFacetBreadcrumbs: exampleNumericFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };

      storeState = {
        [exampleFacetId]: {
          facetId: exampleFacetId,
          format: (item) => `${item.start} - ${item.end}`,
        },
      };
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const numericFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.numericFacetBreadcrumb
      );

      expect(numericFacetBreadcrumbs.length).toBe(
        exampleNumericFacetBreadcrumbs.length
      );
      numericFacetBreadcrumbs.forEach((numericFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = exampleNumericFacetBreadcrumbs[index];
        const facetBreadcrumbValues = Array.from(
          numericFacetBreadcrumb.querySelectorAll(
            selectors.numericFacetBreadcrumbValue
          )
        );

        expect(facetBreadcrumbValues.length).toBe(
          exampleFacetBreadcrumb.values.length
        );

        const labels = facetBreadcrumbValues.map(
          (facetBreadcrumbValue) => facetBreadcrumbValue.label
        );
        const values = exampleFacetBreadcrumb.values.map(
          (item) => `${item.value.start} - ${item.value.end}`
        );
        expect(labels).toEqual(values);
      });
    });
  });

  describe('date facet breadcrumbs', () => {
    const exampleDateFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: exampleFacetId,
        values: [
          {value: {start: 'yesterday', end: 'today'}},
          {value: {start: 'today', end: 'tomorrow'}},
        ],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        dateFacetBreadcrumbs: exampleDateFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };

      storeState = {
        [exampleFacetId]: {
          facetId: exampleFacetId,
          format: (item) => `${item.start} - ${item.end}`,
        },
      };
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const dateFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.dateFacetBreadcrumb
      );

      expect(dateFacetBreadcrumbs.length).toBe(
        exampleDateFacetBreadcrumbs.length
      );

      dateFacetBreadcrumbs.forEach((dateFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = exampleDateFacetBreadcrumbs[index];
        const facetBreadcrumbValues = Array.from(
          dateFacetBreadcrumb.querySelectorAll(
            selectors.dateFacetBreadcrumbValue
          )
        );

        expect(facetBreadcrumbValues.length).toBe(
          exampleFacetBreadcrumb.values.length
        );

        const labels = facetBreadcrumbValues.map(
          (facetBreadcrumbValue) => facetBreadcrumbValue.label
        );
        const values = exampleFacetBreadcrumb.values.map(
          (item) => `${item.value.start} - ${item.value.end}`
        );
        expect(labels).toEqual(values);
      });
    });
  });
});
