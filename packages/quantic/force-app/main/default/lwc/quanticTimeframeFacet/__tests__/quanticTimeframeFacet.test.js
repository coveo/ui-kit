/* eslint-disable no-import-assign */
import QuanticTimeframeFacet from 'c/quanticTimeframeFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  Store: {
    facetTypes: {
      DATEFACETS: 'dateFacets',
    },
  },
  I18nUtils: {
    format: jest.fn(),
    formatDate: jest.fn(),
    getShortDatePattern: jest.fn(),
    getLabelNameWithCount: jest.fn(),
  },
  fromSearchApiDate: jest.fn(),
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-test="facet-content"]',
  componentError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  datePicker: '[data-testid="facet__date-picker"]',
};

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const exampleFilterId = `${exampleFacetId}_input`;
const exampleFacetValues = [
  {start: '2025-04-06', end: '2025-04-07', numberOfResults: 10},
];
const exampleEngine = {
  id: 'example engine id',
};

const defaultOptions = {
  engineId: exampleEngine.id,
  field: exampleField,
  facetId: exampleFacetId,
  label: 'example label',
  injectionDepth: 1000,
  withDatePicker: true,
};

const initialFacetState = {
  facetId: exampleFacetId,
  values: exampleFacetValues,
  enabled: true,
};
let facetState = initialFacetState;

const initialFilterState = {
  facetId: exampleFilterId,
};
let filterState = initialFilterState;

const initialSearchStatusState = {
  isLoading: false,
  hasError: false,
  firstSearchExecuted: true,
  hasResults: false,
};
let searchStatusState = initialSearchStatusState;

const parentFacetIdError = `The ${exampleField} c-quantic-timeframe-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-timeframe-facet requires dependsOn.expectedValue to be a valid string.`;

const functionsMocks = {
  buildDateFacet: jest.fn(() => ({
    subscribe: functionsMocks.dateFacetStateSubscriber,
    state: facetState,
  })),
  buildDateFilter: jest.fn(() => ({
    subscribe: functionsMocks.dateFilterStateSubscriber,
    state: filterState,
  })),
  stopWatching: jest.fn(),
  buildFacetConditionsManager: jest.fn(() => ({
    stopWatching: functionsMocks.stopWatching,
  })),
  buildSearchStatus: jest.fn(() => ({
    subscribe: functionsMocks.searchStatusStateSubscriber,
    state: searchStatusState,
  })),
  dateFacetStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.dateFacetStateUnsubscriber;
  }),
  dateFilterStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.dateFilterStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  dateFacetStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  dateFilterStateUnsubscriber: jest.fn(),
  registerToStore: jest.fn(),
};

const createTestComponent = buildCreateTestComponent(
  QuanticTimeframeFacet,
  'c-quantic-timeframe-facet',
  defaultOptions
);

// @ts-ignore
mockHeadlessLoader.registerToStore = functionsMocks.registerToStore;

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
    if (element instanceof QuanticTimeframeFacet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticTimeframeFacet) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-timeframe-facet', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    mockBueno();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    facetState = initialFacetState;
    filterState = initialFilterState;
    searchStatusState = initialSearchStatusState;
    isInitialized = false;
  });

  describe('component initialization', () => {
    it('should initialize the facet controller and the search status controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildDateFacet).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: defaultOptions.field,
            facetId: defaultOptions.facetId,
            generateAutomaticRanges: false,
            sortCriteria: 'descending',
            injectionDepth: defaultOptions.injectionDepth,
          }),
        })
      );
    });

    it('should register the facet to the quantic store', async () => {
      const expectedFacetType = 'dateFacets';
      const element = createTestComponent();
      await flushPromises();

      expect(functionsMocks.registerToStore).toHaveBeenCalledTimes(1);
      expect(functionsMocks.registerToStore).toHaveBeenCalledWith(
        exampleEngine.id,
        expectedFacetType,
        expect.objectContaining({
          label: defaultOptions.label,
          facetId: defaultOptions.facetId,
          element: element,
        })
      );
    });

    it('should subscribe to the headless facet state and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.dateFacetStateSubscriber).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
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
        expect(functionsMocks.buildDateFilter).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(2);
        expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledWith(
          exampleEngine,
          {
            facetId: exampleFacetId,
          }
        );
        expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledWith(
          exampleEngine,
          {
            facetId: exampleFilterId,
          }
        );

        expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(2);
        expect(generateFacetDependencyConditions).toHaveBeenCalledWith({
          [exampleFacetDependency.parentFacetId]:
            exampleFacetDependency.expectedValue,
        });
      });

      it('should not build the controller when the dependsOn property is not set', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildDateFilter).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(0);
        expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
      });
    });

    describe('the date filter controller', () => {
      it('should initialize the date filter controller and subscribe to its state changes when the property withDatePicker is set to true', async () => {
        createTestComponent({
          ...defaultOptions,
          withDatePicker: true,
        });
        await flushPromises();

        expect(functionsMocks.buildDateFilter).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildDateFilter).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({
              field: defaultOptions.field,
              facetId: `${defaultOptions.facetId}_input`,
            }),
          })
        );
        expect(functionsMocks.dateFilterStateSubscriber).toHaveBeenCalledTimes(
          1
        );
      });

      it('should not initialize the date filter controller and subscribe to its state changes when the property withDatePicker is set to false', async () => {
        createTestComponent({
          ...defaultOptions,
          withDatePicker: false,
        });
        await flushPromises();

        expect(functionsMocks.buildDateFilter).toHaveBeenCalledTimes(0);
        expect(functionsMocks.dateFilterStateSubscriber).toHaveBeenCalledTimes(
          0
        );
      });
    });

    describe('when an initialization error occurs', () => {
      beforeEach(() => {
        mockErroneousHeadlessInitialization();
      });

      it('should display the initialization error component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const componentError = element.shadowRoot.querySelector(
          selectors.componentError
        );

        expect(componentError).not.toBeNull();
      });
    });
  });

  describe('the facet enablement', () => {
    describe('when the facet is enabled', () => {
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
        facetState = {...facetState, enabled: false};
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
  });

  describe('when the component is loading', () => {
    beforeEach(() => {
      searchStatusState = {
        ...initialSearchStatusState,
        isLoading: true,
        hasError: false,
        firstSearchExecuted: false,
      };
    });

    it('should display the placeholder component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );
      expect(placeholder).not.toBeNull();
    });

    describe('when the interface has an error', () => {
      beforeEach(() => {
        searchStatusState = {
          ...initialSearchStatusState,
          isLoading: true,
          hasError: true,
          firstSearchExecuted: false,
        };
      });

      it('should not display the placeholder component', async () => {
        const element = createTestComponent();
        await flushPromises();

        const placeholder = element.shadowRoot.querySelector(
          selectors.placeholder
        );
        expect(placeholder).toBeNull();
      });
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

  describe('the date picker', () => {
    describe('when the property withDatePicker is set to false', () => {
      it('should not display the date picker', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          withDatePicker: false,
        });
        await flushPromises();

        const datePicker = element.shadowRoot.querySelector(
          selectors.datePicker
        );
        expect(datePicker).toBeNull();
      });
    });

    describe('when the property withDatePicker is set to true', () => {
      describe('when a filter range is selected', () => {
        beforeEach(() => {
          filterState = {
            ...filterState,
            range: {start: '2025-04-06', end: '2025-04-07'},
          };
        });

        it('should display the date picker', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withDatePicker: true,
          });
          await flushPromises();

          const datePicker = element.shadowRoot.querySelector(
            selectors.datePicker
          );
          expect(datePicker).not.toBeNull();
        });
      });

      describe('no results are returned', () => {
        beforeEach(() => {
          searchStatusState = {...searchStatusState, hasResults: false};
        });
        it('should not display the date picker', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withDatePicker: false,
          });
          await flushPromises();

          const datePicker = element.shadowRoot.querySelector(
            selectors.datePicker
          );
          expect(datePicker).toBeNull();
        });
      });

      describe('when results are returned', () => {
        beforeEach(() => {
          searchStatusState = {...searchStatusState, hasResults: true};
        });

        describe('when no facet values have results', () => {
          beforeEach(() => {
            facetState = {
              ...facetState,
              values: [
                {start: '2025-04-06', end: '2025-04-07', numberOfResults: 0},
              ],
            };
          });

          it('should not display the date picker', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              withDatePicker: true,
            });
            await flushPromises();

            const datePicker = element.shadowRoot.querySelector(
              selectors.datePicker
            );
            expect(datePicker).toBeNull();
          });
        });

        describe('when at least one facet value has results', () => {
          beforeEach(() => {
            facetState = {
              ...facetState,
              values: [
                {start: '2025-04-06', end: '2025-04-07', numberOfResults: 10},
              ],
            };
          });

          it('should display the date picker', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              withDatePicker: true,
            });
            await flushPromises();

            const datePicker = element.shadowRoot.querySelector(
              selectors.datePicker
            );
            expect(datePicker).not.toBeNull();
          });
        });
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
        2
      );

      document.body.removeChild(element);
      expect(functionsMocks.stopWatching).toHaveBeenCalledTimes(2);
    });
  });
});
