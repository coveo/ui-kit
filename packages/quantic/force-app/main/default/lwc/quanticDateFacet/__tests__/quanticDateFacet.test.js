/* eslint-disable no-import-assign */
import QuanticDateFacet from 'c/quanticDateFacet';
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
    getLabelNameWithCount: jest.fn(),
  },
  fromSearchApiDate: jest.fn((value) => value),
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-test="facet-content"]',
  componentError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  cardContainer: 'c-quantic-card-container',
  clearSelectionButton: '[data-testid="clear-selection-button"]',
  facetBody: '[data-testid="facet__body"]',
  facetCollapseToggle: 'lightning-button-icon',
  facetValue: 'c-quantic-facet-value',
};

const exampleStartDate = '2025-1-1';
const exampleEndDate = '2025-1-2';
const exampleFacetValues = [
  {start: exampleStartDate, end: exampleEndDate, numberOfResults: 10},
];
const exampleEngine = {
  id: 'example engine',
};
const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const defaultOptions = {
  engineId: exampleEngine.id,
  field: exampleField,
  facetId: exampleFacetId,
  numberOfValues: 10,
  label: 'example label',
  formattingFunction: (v) => v,
};

const initialFacetState = {
  facetId: exampleFacetId,
  values: [],
  enabled: true,
};
let facetState = initialFacetState;

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const parentFacetIdError = `The ${exampleField} c-quantic-date-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-date-facet requires dependsOn.expectedValue to be a valid string.`;

const createTestComponent = buildCreateTestComponent(
  QuanticDateFacet,
  'c-quantic-date-facet',
  defaultOptions
);

const functionsMocks = {
  buildDateFacet: jest.fn(() => ({
    state: facetState,
    subscribe: functionsMocks.facetStateSubscriber,
    deselectAll: functionsMocks.deselectAll,
    toggleSelect: functionsMocks.toggleSelect,
  })),
  buildFacetConditionsManager: jest.fn(() => ({
    stopWatching: functionsMocks.stopWatching,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  stopWatching: jest.fn(),
  facetStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.facetStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  facetStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  deselectAll: jest.fn(),
  toggleSelect: jest.fn(),
  registerToStore: jest.fn(),
  eventHandler: jest.fn(),
};

// @ts-ignore
mockHeadlessLoader.registerToStore = functionsMocks.registerToStore;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildDateFacet: functionsMocks.buildDateFacet,
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
    if (element instanceof QuanticDateFacet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticDateFacet) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-date-facet', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    mockBueno();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    facetState = initialFacetState;
    searchStatusState = initialSearchStatusState;
    isInitialized = false;
  });

  describe('component initialization', () => {
    it('should initialize the facet controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildDateFacet).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: exampleField,
            facetId: exampleFacetId,
            numberOfValues: defaultOptions.numberOfValues,
            generateAutomaticRanges: true,
          }),
        })
      );
      expect(functionsMocks.facetStateSubscriber).toHaveBeenCalledTimes(1);
    });

    it('should initialize the search status controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
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
          facetId: exampleFacetId,
          element: element,
        })
      );
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
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(1);
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

        expect(functionsMocks.buildDateFacet).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(0);
        expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('the facet enablement', () => {
    describe('when the facet is enabled', () => {
      beforeEach(() => {
        facetState = {
          ...facetState,
          enabled: true,
        };
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
      beforeEach(() => {
        facetState = {
          ...facetState,
          enabled: false,
        };
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
        ...initialFacetState,
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
          ...initialFacetState,
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

  describe('when the component is initialized', () => {
    describe('when the facet has values', () => {
      beforeEach(() => {
        facetState = {
          ...initialFacetState,
          values: exampleFacetValues,
        };
      });

      it('should display the facet values', async () => {
        const expectedFacetValues = exampleFacetValues.map((facetValue) => ({
          ...facetValue,
          checked: false,
          highlightedResult: facetValue.value,
        }));
        const element = createTestComponent({
          ...defaultOptions,
          noSearch: true,
        });
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        const facetValueElements = element.shadowRoot.querySelectorAll(
          selectors.facetValue
        );

        expect(cardContainer).not.toBeNull();
        expect(facetValueElements.length).toBe(expectedFacetValues.length);
        expectedFacetValues.forEach((facetValue, index) => {
          expect(facetValueElements[index].item).toEqual(facetValue);
        });
      });

      describe('when the facet values have no results', () => {
        it('should not display the facet card when the facet values have no results', async () => {
          facetState = {
            ...facetState,
            values: [{...exampleFacetValues[0], numberOfResults: 0}],
          };
          const element = createTestComponent();
          await flushPromises();

          const cardContainer = element.shadowRoot.querySelector(
            selectors.cardContainer
          );
          expect(cardContainer).toBeNull();
        });
      });

      describe('when the facet has active values', () => {
        beforeEach(() => {
          facetState = {
            ...facetState,
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

        it('should call the deselectAll and the updateText functions of the facet controller when clicking on the clear selection button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const clearSelectionButton = element.shadowRoot.querySelector(
            selectors.clearSelectionButton
          );

          await clearSelectionButton.click();

          expect(functionsMocks.deselectAll).toHaveBeenCalledTimes(1);
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
              ...facetState,
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
    });

    describe('when the facet has no values', () => {
      beforeEach(() => {
        facetState = {
          ...facetState,
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
      });
      await flushPromises();
      expect(functionsMocks.buildFacetConditionsManager).toHaveBeenCalledTimes(
        1
      );

      document.body.removeChild(element);
      expect(functionsMocks.stopWatching).toHaveBeenCalledTimes(1);
      expect(functionsMocks.facetStateUnsubscriber).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from the facet state', async () => {
      const element = createTestComponent();
      await flushPromises();

      document.body.removeChild(element);
      expect(functionsMocks.facetStateUnsubscriber).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from the searchstatus state', async () => {
      const element = createTestComponent();
      await flushPromises();

      document.body.removeChild(element);
      expect(
        functionsMocks.searchStatusStateUnsubscriber
      ).toHaveBeenCalledTimes(1);
    });
  });
});
