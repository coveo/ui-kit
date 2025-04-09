/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticBreadcrumbManager from 'c/quanticBreadcrumbManager';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('@salesforce/label/c.quantic_Colon', () => ({default: ':'}), {
  virtual: true,
});

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
  initializationError: 'c-quantic-component-error',
  breadcrumbShowMoreButton: '[data-testid="breadcrumb-manager__more-button"]',
  breadcrumbClearAllFiltersButton:
    '[data-testid="breadcrumb-manager__clear-button"]',
  facetBreadcrumb: '[data-testid="facet-breadcrumb"]',
  facetBreadcrumbValue: '[data-testid="facet-breadcrumb-value"]',
  categoryFacetBreadcrumb: '[data-testid="category-facet-breadcrumb"]',
  categoryFacetBreadcrumbValue:
    '[data-testid="category-facet-breadcrumb-value"]',
  numericFacetBreadcrumb: '[data-testid="numeric-facet-breadcrumb"]',
  numericFacetBreadcrumbValue: '[data-testid="numeric-facet-breadcrumb-value"]',
  numericFacetBreadcrumbFieldName:
    '[data-testid="numeric-facet-breadcrumb-field-name"]',
  dateFacetBreadcrumb: '[data-testid="date-facet-breadcrumb"]',
  dateFacetBreadcrumbValue: '[data-testid="date-facet-breadcrumb-value"]',
  dateFacetBreadcrumbFieldName:
    '[data-testid="date-facet-breadcrumb-field-name"]',
};

const exampleEngine = {
  id: 'dummy engine',
};
const defaultCollapseThreshold = 5;
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

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticBreadcrumbManager) {
      element.setInitializationError();
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

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the initialization error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const errorComponent = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(errorComponent).not.toBeNull();
    });
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the breadcrumb manager and subscribe to state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('facet breadcrumbs rendering', () => {
    const exampleFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: 'facetIdOne',
        values: [{value: {value: 'one'}}, {value: {value: 'two'}}],
      },
      {
        field: 'fieldTwo',
        facetId: 'facetIdTwo',
        values: [{value: {value: 'three'}}, {value: {value: 'four'}}],
      },
    ];

    beforeEach(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        facetBreadcrumbs: exampleFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };
      storeState = exampleFacetBreadcrumbs.reduce((acc, breadcrumb) => {
        acc[breadcrumb.facetId] = {
          facetId: breadcrumb.facetId,
          format: (value) => value,
        };
        return acc;
      }, {});
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

        const breadcrumbClearAllFiltersButton =
          element.shadowRoot.querySelector(
            selectors.breadcrumbClearAllFiltersButton
          );
        expect(breadcrumbClearAllFiltersButton).not.toBeNull();
      });
    });

    describe('when the number of selected values for one facet exceeds the collapse threshold', () => {
      const testManyFacetBreadcrumbs = [
        {
          field: 'fieldOne',
          facetId: 'facetIdOne',
          values: [
            {value: {value: 'one'}},
            {value: {value: 'two'}},
            {value: {value: 'three'}},
            {value: {value: 'four'}},
            {value: {value: 'five'}},
            {value: {value: 'six'}},
          ],
        },
      ];

      beforeEach(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          facetBreadcrumbs: testManyFacetBreadcrumbs,
          hasBreadcrumbs: true,
        };
        storeState = testManyFacetBreadcrumbs.reduce((acc, breadcrumb) => {
          acc[breadcrumb.facetId] = {
            facetId: breadcrumb.facetId,
            format: (value) => value,
          };
          return acc;
        }, {});
      });

      it('should collapse the values and display a show more button', async () => {
        const element = createTestComponent();
        await flushPromises();

        const facetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.facetBreadcrumb
        );
        expect(facetBreadcrumbs.length).toBe(testManyFacetBreadcrumbs.length);

        const firstFacetBreadcrumb = facetBreadcrumbs[0];
        const facetBreadcrumbValues = Array.from(
          firstFacetBreadcrumb.querySelectorAll(selectors.facetBreadcrumbValue)
        );
        expect(facetBreadcrumbValues.length).toBe(defaultCollapseThreshold);
        facetBreadcrumbValues.forEach((facetBreadcrumbValue, index) => {
          const facetValueLabel = facetBreadcrumbValue.label.value;
          expect(facetValueLabel).toBe(
            testManyFacetBreadcrumbs[0].values[index].value.value
          );
        });

        const breadcrumbShowMoreButton = element.shadowRoot.querySelector(
          selectors.breadcrumbShowMoreButton
        );
        expect(breadcrumbShowMoreButton).not.toBeNull();
      });

      it('should expand the values when the show more button is clicked', async () => {
        const element = createTestComponent();
        await flushPromises();

        const facetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.facetBreadcrumb
        );
        const firstFacetBreadcrumb = facetBreadcrumbs[0];

        const facetBreadcrumbValues = Array.from(
          firstFacetBreadcrumb.querySelectorAll(selectors.facetBreadcrumbValue)
        );
        expect(facetBreadcrumbValues.length).toBe(defaultCollapseThreshold);

        const breadcrumbShowMoreButton = element.shadowRoot.querySelector(
          selectors.breadcrumbShowMoreButton
        );
        expect(breadcrumbShowMoreButton).not.toBeNull();

        breadcrumbShowMoreButton.click();
        await flushPromises();

        const facetBreadcrumbValuesAfterClick = Array.from(
          firstFacetBreadcrumb.querySelectorAll(selectors.facetBreadcrumbValue)
        );
        expect(facetBreadcrumbValuesAfterClick.length).toBe(
          testManyFacetBreadcrumbs[0].values.length
        );
        const breadcrumbShowMoreButtonAfterClick =
          element.shadowRoot.querySelector(selectors.breadcrumbShowMoreButton);
        expect(breadcrumbShowMoreButtonAfterClick).toBeNull();
      });
    });

    describe('with a custom collapse threshold', () => {
      const customCollapseThreshold = 3;
      const testManyFacetBreadcrumbs = [
        {
          field: 'fieldOne',
          facetId: 'facetIdOne',
          values: [
            {value: {value: 'one'}},
            {value: {value: 'two'}},
            {value: {value: 'three'}},
            {value: {value: 'four'}},
            {value: {value: 'five'}},
            {value: {value: 'six'}},
          ],
        },
      ];

      beforeEach(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          facetBreadcrumbs: testManyFacetBreadcrumbs,
          hasBreadcrumbs: true,
        };
        storeState = testManyFacetBreadcrumbs.reduce((acc, breadcrumb) => {
          acc[breadcrumb.facetId] = {
            facetId: breadcrumb.facetId,
            format: (value) => value,
          };
          return acc;
        }, {});
      });
      it('should collapse the values over the custom collapse threshold and display a show more button', async () => {
        const element = createTestComponent({
          collapseThreshold: customCollapseThreshold,
        });
        await flushPromises();

        const facetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.facetBreadcrumb
        );
        expect(facetBreadcrumbs.length).toBe(testManyFacetBreadcrumbs.length);

        const firstFacetBreadcrumb = facetBreadcrumbs[0];
        const facetBreadcrumbValues = Array.from(
          firstFacetBreadcrumb.querySelectorAll(selectors.facetBreadcrumbValue)
        );
        expect(facetBreadcrumbValues.length).toBe(customCollapseThreshold);
        facetBreadcrumbValues.forEach((facetBreadcrumbValue, index) => {
          const facetValueLabel = facetBreadcrumbValue.label.value;
          expect(facetValueLabel).toBe(
            testManyFacetBreadcrumbs[0].values[index].value.value
          );
        });

        const breadcrumbShowMoreButton = element.shadowRoot.querySelector(
          selectors.breadcrumbShowMoreButton
        );
        expect(breadcrumbShowMoreButton).not.toBeNull();
      });
    });
  });

  describe('category facet breadcrumbs', () => {
    const testCategoryFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: 'facetIdOne',
        path: [{value: 'one'}, {value: 'two'}],
      },
      {
        field: 'fieldTwo',
        facetId: 'facetIdTwo',
        path: [{value: 'three'}, {value: 'four'}],
      },
    ];

    beforeEach(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        categoryFacetBreadcrumbs: testCategoryFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };
      storeState = testCategoryFacetBreadcrumbs.reduce((acc, breadcrumb) => {
        acc[breadcrumb.facetId] = {
          facetId: breadcrumb.facetId,
          format: (item) => item.value,
        };
        return acc;
      }, {});
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const categoryFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.categoryFacetBreadcrumb
      );

      expect(categoryFacetBreadcrumbs.length).toBe(
        testCategoryFacetBreadcrumbs.length
      );
      categoryFacetBreadcrumbs.forEach((categoryFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = testCategoryFacetBreadcrumbs[index];
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

    describe('with a custom category divider', () => {
      it('should display the breadcrumb values with the custom divider', async () => {
        const customCategoryDivider = '*';
        const element = createTestComponent({
          categoryDivider: customCategoryDivider,
        });
        await flushPromises();

        const categoryFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.categoryFacetBreadcrumb
        );

        expect(categoryFacetBreadcrumbs.length).toBe(
          testCategoryFacetBreadcrumbs.length
        );

        categoryFacetBreadcrumbs.forEach((categoryFacetBreadcrumb, index) => {
          const exampleFacetBreadcrumb = testCategoryFacetBreadcrumbs[index];
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
          expect(labels).toEqual([values.join(` ${customCategoryDivider} `)]);
        });
      });
    });
  });

  describe('numeric facet breadcrumbs', () => {
    const testNumericFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: 'facetIdOne',
        values: [{value: {start: 0, end: 1}}, {value: {start: 1, end: 2}}],
      },
      {
        field: 'fieldTwo',
        facetId: 'facetIdTwo',
        values: [{value: {start: 10, end: 11}}, {value: {start: 20, end: 21}}],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        numericFacetBreadcrumbs: testNumericFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };
      storeState = testNumericFacetBreadcrumbs.reduce((acc, breadcrumb) => {
        acc[breadcrumb.facetId] = {
          facetId: breadcrumb.facetId,
          format: (item) => `${item.start} - ${item.end}`,
        };
        return acc;
      }, {});
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const numericFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.numericFacetBreadcrumb
      );

      expect(numericFacetBreadcrumbs.length).toBe(
        testNumericFacetBreadcrumbs.length
      );
      numericFacetBreadcrumbs.forEach((numericFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = testNumericFacetBreadcrumbs[index];
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

    describe('when a numeric range is set with a numeric filter', () => {
      const exampleLabel = 'Field one';
      const exampleField = 'fieldOne';
      const testNumericFacetBreadcrumbsWithFilter = [
        {
          field: exampleField,
          facetId: `${exampleField}_input`,
          values: [{value: {start: 10, end: 11}}],
        },
      ];

      beforeAll(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          numericFacetBreadcrumbs: testNumericFacetBreadcrumbsWithFilter,
          hasBreadcrumbs: true,
        };
        storeState = {
          [exampleField]: {
            facetId: exampleField,
            label: exampleLabel,
            format: (item) => `${item.start} - ${item.end}`,
          },
        };
      });

      it('should display the breadcrumb values with correct labels', async () => {
        const element = createTestComponent();
        await flushPromises();

        const numericFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.numericFacetBreadcrumb
        );

        expect(numericFacetBreadcrumbs.length).toBe(
          testNumericFacetBreadcrumbsWithFilter.length
        );
        numericFacetBreadcrumbs.forEach((numericFacetBreadcrumb, index) => {
          const exampleFacetBreadcrumb =
            testNumericFacetBreadcrumbsWithFilter[index];

          const numericFacetBreadcrumbFieldName =
            numericFacetBreadcrumb.querySelector(
              selectors.numericFacetBreadcrumbFieldName
            );
          expect(numericFacetBreadcrumbFieldName.textContent).toBe(
            `${exampleLabel}: `
          );

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
  });

  describe('date facet breadcrumbs', () => {
    const testDateFacetBreadcrumbs = [
      {
        field: 'fieldOne',
        facetId: 'facetIdOne',
        values: [
          {value: {start: 'yesterday', end: 'today'}},
          {value: {start: 'today', end: 'tomorrow'}},
        ],
      },
      {
        field: 'fieldTwo',
        facetId: 'facetIdTwo',
        values: [
          {value: {start: 'last week', end: 'today'}},
          {value: {start: 'tomorrow', end: 'next week'}},
        ],
      },
    ];

    beforeAll(() => {
      breadcrumbManagerState = {
        ...breadcrumbManagerState,
        dateFacetBreadcrumbs: testDateFacetBreadcrumbs,
        hasBreadcrumbs: true,
      };
      storeState = testDateFacetBreadcrumbs.reduce((acc, breadcrumb) => {
        acc[breadcrumb.facetId] = {
          facetId: breadcrumb.facetId,
          format: (item) => `${item.start} - ${item.end}`,
        };
        return acc;
      }, {});
    });

    it('should properly display the breadcrumb values', async () => {
      const element = createTestComponent();
      await flushPromises();

      const dateFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
        selectors.dateFacetBreadcrumb
      );

      expect(dateFacetBreadcrumbs.length).toBe(testDateFacetBreadcrumbs.length);

      dateFacetBreadcrumbs.forEach((dateFacetBreadcrumb, index) => {
        const exampleFacetBreadcrumb = testDateFacetBreadcrumbs[index];
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

    describe('when a date range is set with a date filter', () => {
      const exampleLabel = 'Field one';
      const exampleField = 'fieldOne';
      const testDateFacetBreadcrumbsWithFilter = [
        {
          field: exampleField,
          facetId: `${exampleField}_input`,
          values: [{value: {start: 'last week', end: 'today'}}],
        },
      ];

      beforeAll(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          dateFacetBreadcrumbs: testDateFacetBreadcrumbsWithFilter,
          hasBreadcrumbs: true,
        };
        storeState = {
          [exampleField]: {
            facetId: exampleField,
            label: exampleLabel,
            format: (item) => `${item.start} - ${item.end}`,
          },
        };
      });

      it('should display the breadcrumb values with correct labels', async () => {
        const element = createTestComponent();
        await flushPromises();

        const dateFacetBreadcrumbs = element.shadowRoot.querySelectorAll(
          selectors.dateFacetBreadcrumb
        );

        expect(dateFacetBreadcrumbs.length).toBe(
          testDateFacetBreadcrumbsWithFilter.length
        );
        dateFacetBreadcrumbs.forEach((dateFacetBreadcrumb, index) => {
          const exampleFacetBreadcrumb =
            testDateFacetBreadcrumbsWithFilter[index];

          const dateFacetBreadcrumbFieldName =
            dateFacetBreadcrumb.querySelector(
              selectors.dateFacetBreadcrumbFieldName
            );
          expect(dateFacetBreadcrumbFieldName.textContent).toBe(
            `${exampleLabel}: `
          );

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
});
