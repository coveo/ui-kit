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
    formatDate: jest.fn(
      (date) =>
        `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
    ),
    getShortDatePattern: jest.fn(),
    getLabelNameWithCount: jest.fn(),
  },
  DateUtils: {
    fromLocalIsoDate: jest.fn((value) => value),
    toLocalSearchApiDate: jest.fn((value) => value),
  },
  fromSearchApiDate: jest.fn((value) => value),
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-testid="facet-content"]',
  cardContainer: 'c-quantic-card-container',
  componentError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  datePicker: '[data-testid="facet__date-picker"]',
  facetValue: 'c-quantic-facet-value',
  clearSelectionButton: '[data-testid="clear-selection-button"]',
  facetBody: '[data-testid="facet__body"]',
  facetCollapseToggle: 'lightning-button-icon',
  datePickerForm: '[data-testid="facet__date-picker"]',
};

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const exampleFilterId = `${exampleFacetId}_input`;
const exampleStartDate = '2025-1-1';
const exampleEndDate = '2025-1-2';

const exampleFacetValues = [
  {start: exampleStartDate, end: exampleEndDate, numberOfResults: 10},
];
const exampleEngineId = 'exampleEngineId';

const defaultOptions = {
  engineId: exampleEngineId,
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
  hasResults: true,
};
let searchStatusState = initialSearchStatusState;

const parentFacetIdError = `The ${exampleField} c-quantic-timeframe-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-timeframe-facet requires dependsOn.expectedValue to be a valid string.`;

const functionsMocks = {
  buildDateFacet: jest.fn(() => ({
    subscribe: functionsMocks.dateFacetStateSubscriber,
    toggleSingleSelect: functionsMocks.toggleSingleSelect,
    state: facetState,
    deselectAll: functionsMocks.deselectAll,
  })),
  buildDateFilter: jest.fn(() => ({
    subscribe: functionsMocks.dateFilterStateSubscriber,
    clear: functionsMocks.clear,
    setRange: functionsMocks.setRange,
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
  eventHandler: jest.fn(),
  toggleSingleSelect: jest.fn(),
  deselectAll: jest.fn(),
  clear: jest.fn(),
  reportValidity: jest.fn(() => true),
  checkValidity: jest.fn(() => true),
  loadDateFacetSetActions: jest.fn(() => ({
    deselectAllDateFacetValues: functionsMocks.deselectAllDateFacetValues,
  })),
  deselectAllDateFacetValues: jest.fn(),
  dispatch: jest.fn(),
  buildDateRange: jest.fn(),
  setRange: jest.fn(),
};

const exampleEngine = {
  id: exampleEngineId,
  dispatch: functionsMocks.dispatch,
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
      loadDateFacetSetActions: functionsMocks.loadDateFacetSetActions,
      buildDateRange: functionsMocks.buildDateRange,
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

async function submitFacetSearchForm(element) {
  const form = element.shadowRoot.querySelector(selectors.datePickerForm);
  form.dispatchEvent(
    new CustomEvent('submit', {bubbles: true, composed: true})
  );
  await flushPromises();
}

function mockInputReportValidity(element) {
  const inputs = [...element.shadowRoot.querySelectorAll('lightning-input')];
  inputs.forEach((input) => {
    input.reportValidity = functionsMocks.reportValidity;
    input.checkValidity = functionsMocks.checkValidity;
  });
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

  describe('when the component is ready', () => {
    describe('when the facet has values', () => {
      beforeEach(() => {
        facetState = {
          ...initialFacetState,
          values: exampleFacetValues,
        };
      });

      it('should display the facet card when the facet values have results', async () => {
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).not.toBeNull();
      });

      it('should not display the facet card when the facet values have no results', async () => {
        facetState = {
          ...initialFacetState,
          values: [
            {start: '2025-01-01', end: '2025-01-02', numberOfResults: 0},
          ],
        };
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).toBeNull();
      });

      it('should display the facet values', async () => {
        const expectedFacetValues = exampleFacetValues.map((facetValue) => ({
          ...facetValue,
          selected: false,
          key: JSON.stringify([facetValue.start, facetValue.end]),
        }));
        const element = createTestComponent();
        await flushPromises();

        const facetValueElements = element.shadowRoot.querySelectorAll(
          selectors.facetValue
        );
        expect(facetValueElements.length).toBe(exampleFacetValues.length);
        expectedFacetValues.forEach((facetValue, index) => {
          expect(facetValueElements[index].item).toEqual(
            expect.objectContaining(facetValue)
          );
          expect(facetValueElements[index].isRangeFacet).toEqual(true);
          expect(facetValueElements[index].displayAsLink).toEqual(true);
        });
      });

      it('should call the controller function toggleSingleSelect when clicked', async () => {
        const element = createTestComponent({
          ...defaultOptions,
        });
        const selectedIndex = 0;
        await flushPromises();

        const facetValueElement = element.shadowRoot.querySelector(
          selectors.facetValue
        );
        const selection = exampleFacetValues[selectedIndex];
        facetValueElement.dispatchEvent(
          new CustomEvent('quantic__selectvalue', {
            bubbles: true,
            detail: {
              value: `${exampleStartDate} - ${exampleEndDate}`,
            },
          })
        );
        await flushPromises();

        expect(functionsMocks.toggleSingleSelect).toHaveBeenCalledTimes(1);
        expect(functionsMocks.toggleSingleSelect).toHaveBeenCalledWith(
          expect.objectContaining(selection)
        );
      });

      describe('when the facet has active values', () => {
        beforeEach(() => {
          facetState = {
            ...initialFacetState,
            hasActiveValues: true,
          };
        });

        it('should display the clear selection button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const clearSelectionButton = element.shadowRoot.querySelector(
            selectors.clearSelectionButton
          );
          expect(clearSelectionButton).not.toBeNull();
        });

        it('should call the deselectAll function of the date facet controller when clicking on the clear selection button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const clearSelectionButton = element.shadowRoot.querySelector(
            selectors.clearSelectionButton
          );

          await clearSelectionButton.click();

          expect(functionsMocks.deselectAll).toHaveBeenCalledTimes(1);
        });
      });

      describe('when the facet has an active range', () => {
        beforeEach(() => {
          filterState = {
            ...initialFilterState,
            range: {start: exampleStartDate, end: exampleEndDate},
          };
        });

        it('should display the clear selection button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const clearSelectionButton = element.shadowRoot.querySelector(
            selectors.clearSelectionButton
          );
          expect(clearSelectionButton).not.toBeNull();
        });

        it('should call the clear function of the date filter controller when clicking on the clear selection button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const clearSelectionButton = element.shadowRoot.querySelector(
            selectors.clearSelectionButton
          );

          await clearSelectionButton.click();

          expect(functionsMocks.clear).toHaveBeenCalledTimes(1);
        });

        it('should not display the facet values', async () => {
          const element = createTestComponent();
          await flushPromises();

          const facetValueElements = element.shadowRoot.querySelectorAll(
            selectors.facetValue
          );
          expect(facetValueElements.length).toBe(0);
        });
      });

      describe('when the facet is not collapsed', () => {
        it('should display the facet body', async () => {
          const element = createTestComponent();
          await flushPromises();

          const facetBody = element.shadowRoot.querySelector(
            selectors.facetBody
          );
          expect(facetBody).not.toBeNull();
        });

        it('should correctly display the facet collapse toggle', async () => {
          const expectedIcon = 'utility:dash';
          const expectedCSSClass = 'facet__collapse';
          const element = createTestComponent();
          await flushPromises();

          const facetCollapseToggle = element.shadowRoot.querySelector(
            selectors.facetCollapseToggle
          );
          expect(facetCollapseToggle).not.toBeNull();
          expect(facetCollapseToggle.iconName).toBe(expectedIcon);
          expect(facetCollapseToggle.classList.contains(expectedCSSClass)).toBe(
            true
          );
        });
      });

      describe('when the facet is collapsed', () => {
        it('should not display the facet body', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            isCollapsed: true,
          });
          await flushPromises();

          const facetBody = element.shadowRoot.querySelector(
            selectors.facetBody
          );
          expect(facetBody).toBeNull();
        });

        it('should correctly display the facet collapse toggle', async () => {
          const expectedIcon = 'utility:add';
          const expectedCSSClass = 'facet__expand';

          const element = createTestComponent({
            ...defaultOptions,
            isCollapsed: true,
          });
          await flushPromises();

          const facetCollapseToggle = element.shadowRoot.querySelector(
            selectors.facetCollapseToggle
          );
          expect(facetCollapseToggle).not.toBeNull();
          expect(facetCollapseToggle.iconName).toBe(expectedIcon);
          expect(facetCollapseToggle.classList.contains(expectedCSSClass)).toBe(
            true
          );
        });

        describe('when a facet value is selected', () => {
          beforeEach(() => {
            facetState = {
              ...initialFacetState,
              hasActiveValues: true,
            };
          });

          it('should display the clear selection button', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              isCollapsed: true,
            });
            await flushPromises();

            const clearSelectionButton = element.shadowRoot.querySelector(
              selectors.clearSelectionButton
            );
            expect(clearSelectionButton).not.toBeNull();
          });
        });
      });

      describe('when a facet range is submitted', () => {
        describe('when one of the inputs is invalid', () => {
          it('should not call the method set range of the date filter controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);
            // Making the first input invalid
            functionsMocks.checkValidity.mockReturnValueOnce(false);

            await submitFacetSearchForm(element);
            expect(functionsMocks.reportValidity).toHaveBeenCalledTimes(2);
            expect(functionsMocks.setRange).not.toHaveBeenCalled();
          });
        });

        describe('when the inputs are valid', () => {
          beforeEach(() => {
            filterState = {
              ...initialFilterState,
              range: {start: exampleStartDate, end: exampleEndDate},
            };
          });

          it('should call the method setRange of the date filter controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);

            await submitFacetSearchForm(element);
            expect(functionsMocks.reportValidity).toHaveBeenCalledTimes(2);
            expect(functionsMocks.setRange).toHaveBeenCalledTimes(1);
          });

          it('should call the method deselectAllDateFacetValues of the date facet controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);

            await submitFacetSearchForm(element);
            expect(
              functionsMocks.deselectAllDateFacetValues
            ).toHaveBeenCalledTimes(1);
            expect(
              functionsMocks.deselectAllDateFacetValues
            ).toHaveBeenCalledWith(exampleFacetId);
          });
        });
      });
    });

    describe('when the facet has no values', () => {
      beforeEach(() => {
        facetState = {
          ...initialFacetState,
          values: [],
        };
      });

      it('should not display the facet card', async () => {
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).toBeNull();
      });

      describe('when a facet range is selected', () => {
        beforeEach(() => {
          filterState = {
            ...initialFilterState,
            range: {start: '2025/01/01', end: '2025/01/02'},
          };
        });

        it('should display the facet card', async () => {
          const element = createTestComponent();
          await flushPromises();

          const cardContainer = element.shadowRoot.querySelector(
            selectors.cardContainer
          );
          expect(cardContainer).not.toBeNull();
        });
      });

      it('should not display the facet card when a facet range is not selected', async () => {
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).toBeNull();
      });

      it('should dispatch quantic__renderfacet event', async () => {
        document.addEventListener(
          'quantic__renderfacet',
          // @ts-ignore
          (event) => functionsMocks.eventHandler(event.detail),
          {once: true}
        );
        createTestComponent();

        await flushPromises();

        expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
        expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
          id: exampleFacetId,
          shouldRenderFacet: false,
        });
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
