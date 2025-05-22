/* eslint-disable no-import-assign */
import QuanticNumericFacet from 'c/quanticNumericFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  Store: {
    facetTypes: {
      NUMERICFACETS: 'numericFacets',
    },
  },
  I18nUtils: {
    format: jest.fn(),
    getLabelNameWithCount: jest.fn(),
  },
}));
jest.mock('c/quanticHeadlessLoader');

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const exampleEngineId = 'exampleEngineId';
const exampleFilterId = `${exampleFacetId}_input`;
const defaultOptions = {
  engineId: exampleEngineId,
  field: exampleField,
  facetId: exampleFacetId,
  sortCriteria: 'ascending',
  numberOfValues: 10,
  rangeAlgorithm: 'even',
  label: 'example label',
  withInput: 'integer',
};
const parentFacetIdError = `The ${exampleField} c-quantic-numeric-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-numeric-facet requires dependsOn.expectedValue to be a valid string.`;

const exampleFacetValues = [
  {start: 1, end: 2, numberOfResults: 10},
  {start: 2, end: 3, numberOfResults: 10},
];

const initialFacetState = {
  facetId: exampleFacetId,
  values: [],
  enabled: true,
};
let facetState = initialFacetState;

const initialFilterState = {
  facetId: exampleFilterId,
};
let filterState = initialFilterState;

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const selectors = {
  facetContent: '[data-testid="facet-content"]',
  componentError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  cardContainer: 'c-quantic-card-container',
  clearSelectionButton: '[data-testid="clear-selection-button"]',
  facetBody: '[data-testid="facet__body"]',
  searchForm: '[data-testid="facet__search-form"]',
  facetValue: 'c-quantic-facet-value',
  facetCollapseToggle: 'lightning-button-icon',
};

const createTestComponent = buildCreateTestComponent(
  QuanticNumericFacet,
  'c-quantic-numeric-facet',
  defaultOptions
);

const functionsMocks = {
  buildNumericFacet: jest.fn(() => ({
    subscribe: functionsMocks.facetStateSubscriber,
    state: facetState,
    deselectAll: functionsMocks.deselectAll,
    toggleSingleSelect: functionsMocks.toggleSingleSelect,
    toggleSelect: functionsMocks.toggleSelect,
  })),
  buildNumericFilter: jest.fn(() => ({
    subscribe: functionsMocks.filterStateSubscriber,
    setRange: functionsMocks.setRange,
    clear: functionsMocks.clear,
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
  facetStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.facetStateUnsubscriber;
  }),
  filterStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.filterStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  facetStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  filterStateUnsubscriber: jest.fn(),
  deselectAll: jest.fn(),
  toggleSingleSelect: jest.fn(),
  toggleSelect: jest.fn(),
  registerToStore: jest.fn(),
  eventHandler: jest.fn(),
  deselectAllNumericFacetValues: jest.fn(),
  loadNumericFacetSetActions: jest.fn(() => ({
    deselectAllNumericFacetValues: functionsMocks.deselectAllNumericFacetValues,
  })),
  dispatch: jest.fn(),
  setRange: jest.fn(),
  clear: jest.fn(),
  reportValidity: jest.fn(() => true),
};

const exampleEngine = {
  id: exampleEngineId,
  dispatch: functionsMocks.dispatch,
};

// @ts-ignore
mockHeadlessLoader.registerToStore = functionsMocks.registerToStore;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildNumericFacet: functionsMocks.buildNumericFacet,
      buildNumericFilter: functionsMocks.buildNumericFilter,
      buildSearchStatus: functionsMocks.buildSearchStatus,
      buildFacetConditionsManager: functionsMocks.buildFacetConditionsManager,
      loadNumericFacetSetActions: functionsMocks.loadNumericFacetSetActions,
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
    if (element instanceof QuanticNumericFacet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticNumericFacet) {
      element.setInitializationError();
    }
  };
}

async function submitFacetSearchForm(element) {
  const form = element.shadowRoot.querySelector(selectors.searchForm);
  form.dispatchEvent(
    new CustomEvent('submit', {bubbles: true, composed: true})
  );
  await flushPromises();
}

async function mockInputReportValidity(element) {
  const inputs = [...element.shadowRoot.querySelectorAll('lightning-input')];
  inputs.forEach((input) => {
    input.reportValidity = functionsMocks.reportValidity;
  });
}

describe('c-quantic-numeric-facet', () => {
  beforeEach(() => {
    prepareHeadlessState();
    mockSuccessfulHeadlessInitialization();
    mockBueno();
  });

  afterEach(() => {
    cleanup();
    facetState = initialFacetState;
    searchStatusState = initialSearchStatusState;
    filterState = initialFilterState;
    isInitialized = false;
  });

  describe('component initialization', () => {
    it('should initialize the facet controller and the search status controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildNumericFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildNumericFacet).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: defaultOptions.field,
            facetId: defaultOptions.facetId,
            generateAutomaticRanges: true,
            rangeAlgorithm: defaultOptions.rangeAlgorithm,
            sortCriteria: defaultOptions.sortCriteria,
            numberOfValues: defaultOptions.numberOfValues,
          }),
        })
      );
    });

    it('should register the facet to the quantic store', async () => {
      const expectedFacetType = 'numericFacets';
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

    it('should subscribe to the headless numeric facet state and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.facetStateSubscriber).toHaveBeenCalledTimes(1);
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
        const expectedArg = {
          [exampleFacetDependency.parentFacetId]:
            exampleFacetDependency.expectedValue,
        };
        expect(generateFacetDependencyConditions).toHaveBeenNthCalledWith(
          1,
          expectedArg
        );
        expect(generateFacetDependencyConditions).toHaveBeenNthCalledWith(
          2,
          expectedArg
        );
      });

      it('should not build the controller when the dependsOn property is not set', async () => {
        createTestComponent();
        await flushPromises();

        expect(functionsMocks.buildNumericFacet).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(0);
        expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
      });
    });

    describe('the withInput property', () => {
      it('should initialize the numeric filter controller and subscribe to its state changes when the property withInput is set', async () => {
        createTestComponent({
          ...defaultOptions,
          withInput: 'integer',
        });
        await flushPromises();

        expect(functionsMocks.buildNumericFilter).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildNumericFilter).toHaveBeenCalledWith(
          exampleEngine,
          expect.objectContaining({
            options: expect.objectContaining({
              field: defaultOptions.field,
              facetId: `${defaultOptions.facetId}_input`,
            }),
          })
        );
        expect(functionsMocks.filterStateSubscriber).toHaveBeenCalledTimes(1);
      });

      it('should not initialize the numeric filter controller and subscribe to its state changes when the property withInput is not set', async () => {
        createTestComponent({
          ...defaultOptions,
          withInput: undefined,
        });
        await flushPromises();

        expect(functionsMocks.buildNumericFilter).toHaveBeenCalledTimes(0);
        expect(functionsMocks.filterStateSubscriber).toHaveBeenCalledTimes(0);
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
      beforeAll(() => {
        facetState = {...initialFacetState, enabled: true};
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
        facetState = {...initialFacetState, enabled: false};
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
          values: [{start: 1, end: 2, numberOfResults: 0}],
        };
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).toBeNull();
      });

      describe.each([
        ['checkbox', 'toggleSelect'],
        ['link', 'toggleSingleSelect'],
      ])(
        'when the property displayValuesAs is set to "%s"',
        (propertyValue, expectedFunctionToBeCalled) => {
          const shouldDisplayValueAsLink = propertyValue === 'link';

          test(`should display the facet value as ${propertyValue}`, async () => {
            const expectedFacetValues = exampleFacetValues.map(
              (facetValue) => ({
                ...facetValue,
                checked: false,
                key: `${facetValue.start}..${facetValue.end}`,
              })
            );
            const element = createTestComponent({
              ...defaultOptions,
              displayValuesAs: propertyValue,
            });
            await flushPromises();

            const facetValueElements = element.shadowRoot.querySelectorAll(
              selectors.facetValue
            );
            expect(facetValueElements.length).toBe(exampleFacetValues.length);
            expectedFacetValues.forEach((facetValue, index) => {
              expect(facetValueElements[index].item).toEqual(facetValue);
              expect(facetValueElements[index].isRangeFacet).toEqual(true);
              expect(facetValueElements[index].displayAsLink).toEqual(
                shouldDisplayValueAsLink
              );
            });
          });

          test(`should call the controller function ${expectedFunctionToBeCalled} when clicked`, async () => {
            const element = createTestComponent({
              ...defaultOptions,
              displayValuesAs: propertyValue,
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
                  value: `${selection.start} - ${selection.end}`,
                },
              })
            );
            await flushPromises();

            expect(
              functionsMocks[expectedFunctionToBeCalled]
            ).toHaveBeenCalledTimes(1);
            expect(
              functionsMocks[expectedFunctionToBeCalled]
            ).toHaveBeenCalledWith(expect.objectContaining(selection));
          });
        }
      );

      describe('when search status has an error', () => {
        beforeEach(() => {
          searchStatusState = {
            ...initialSearchStatusState,
            hasError: true,
          };
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

      describe('when the facet has active values', () => {
        beforeEach(() => {
          facetState = {
            ...initialFacetState,
            values: [{start: 1, end: 2, numberOfResults: 10}],
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

        it('should call the deselectAll function of the numeric facet controller when clicking on the clear selection button', async () => {
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
            range: {start: 1, end: 2},
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

        it('should call the clear function of the numeric filter controller when clicking on the clear selection button', async () => {
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
              values: [{start: 1, end: 2, numberOfResults: 10}],
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
          it('should not call the method set range of the numeric filter controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);
            // Making the first input invalid
            functionsMocks.reportValidity.mockReturnValueOnce(false);

            await submitFacetSearchForm(element);
            expect(functionsMocks.reportValidity).toHaveBeenCalledTimes(1);
            expect(functionsMocks.setRange).not.toHaveBeenCalled();
          });
        });

        describe('when the inputs are valid', () => {
          const expectedRange = {start: 1, end: 2};
          beforeEach(() => {
            filterState = {
              ...initialFilterState,
              range: expectedRange,
            };
          });

          it('should call the method setRange of the numeric filter controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);

            await submitFacetSearchForm(element);
            expect(functionsMocks.reportValidity).toHaveBeenCalledTimes(2);
            expect(functionsMocks.setRange).toHaveBeenCalledTimes(1);
            expect(functionsMocks.setRange).toHaveBeenCalledWith(expectedRange);
          });

          it('should call the method deselectAllNumericFacetValues of the numeric facet controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            mockInputReportValidity(element);

            await submitFacetSearchForm(element);
            expect(
              functionsMocks.deselectAllNumericFacetValues
            ).toHaveBeenCalledTimes(1);
            expect(
              functionsMocks.deselectAllNumericFacetValues
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
            range: {start: 1, end: 2},
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

      it('should display the facet card when a facet range is selected', async () => {
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

  describe('when the component is disconnected', () => {
    it('should make the condition manager stop watching the facet', async () => {
      const exampleFacetDependency = {
        parentFacetId: 'filetype',
        expectedValue: 'txt',
      };
      const element = createTestComponent({
        ...defaultOptions,
        dependsOn: exampleFacetDependency,
        withInput: true,
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
