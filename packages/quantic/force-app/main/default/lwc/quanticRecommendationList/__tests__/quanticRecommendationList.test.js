/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticRecommendationList from 'c/quanticRecommendationList';
import {cleanup, flushPromises, buildCreateTestComponent} from 'c/testUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

const recommendationsArray = [
  {
    title: 'Title 1',
    clickUri: 'https://example.com/1',
    excerpt: 'Excerpt 1',
  },
  {
    title: 'Title 2',
    clickUri: 'https://example.com/2',
    excerpt: 'Excerpt 2',
  },
];

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  ...jest.requireActual('c/quanticUtils'),
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
}));

jest.mock(
  '@salesforce/label/c.quantic_InvalidPositiveIntegerProperty',
  () => ({
    default:
      'The value of the {{0}} property must be an integer greater than 0.',
  }),
  {
    virtual: true,
  }
);

let isInitialized = false;
let consoleErrorSpy;
const initialRecommendationListState = {
  isLoading: false,
  recommendations: recommendationsArray,
  error: null,
  searchResponseId: '123',
};

let recommendationListState = initialRecommendationListState;

const functionMocks = {
  buildRecommendationList: jest.fn(() => ({
    state: recommendationListState,
    subscribe: functionMocks.subscribe,
  })),
  buildResultTemplatesManager: jest.fn(() => ({
    registerTemplates: functionMocks.registerTemplates,
  })),
  loadFieldActions: jest.fn(() => ({
    registerFieldsToInclude: functionMocks.registerFieldsToInclude,
  })),
  subscribe: jest.fn((callback) => {
    callback();
    return functionMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
  dispatch: jest.fn(() => {}),
  registerTemplates: jest.fn(() => {
    return {
      content: jest.fn(),
      conditions: [],
    };
  }),
  registerFieldsToInclude: jest.fn((fieldsToInclude) => {
    return {
      fieldsToInclude,
    };
  }),
};

const exampleEngine = {
  id: 'exampleEngineId',
  dispatch: functionMocks.dispatch,
};
const defaultFieldsToInclude = 'field1,field2';

const defaultOptions = {
  engineId: exampleEngine.id,
  recommendation: 'recommendation',
  numberOfRecommendations: 10,
  label: 'Top documents for you',
  variant: 'grid',
  recommendationsPerRow: 3,
  fieldsToInclude: defaultFieldsToInclude,
};

const selectors = {
  initializationError: 'c-quantic-component-error',
  gridContainer: '[data-testid="recommendations__grid"]',
  carouselContainer: '[data-testid="recommendations__carousel"]',
  recommendationListItem: '[data-testid="recommendations__item"]',
  recommendationListResult: 'c-quantic-result',
  placeholder: 'c-quantic-placeholder',
  quanticHeading: 'c-quantic-heading',
};

const createTestComponent = buildCreateTestComponent(
  QuanticRecommendationList,
  'c-quantic-recommendation-list',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildRecommendationList: functionMocks.buildRecommendationList,
      buildResultTemplatesManager: functionMocks.buildResultTemplatesManager,
      loadFieldActions: functionMocks.loadFieldActions,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRecommendationList && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticRecommendationList) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-recommendation-list', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
    recommendationListState = initialRecommendationListState;
  });

  describe('when the component is loading', () => {
    it('should display the placeholder component when loading', async () => {
      recommendationListState = {
        isLoading: true,
        recommendations: [],
        error: null,
        searchResponseId: null,
      };
      const element = createTestComponent();
      await flushPromises();

      const loadingPlaceholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );

      expect(loadingPlaceholder).not.toBeNull();
    });

    it('should not display the placeholder component when there is an error in the state', async () => {
      recommendationListState = {
        isLoading: true,
        recommendations: [],
        error: {
          statusCode: 500,
          message: 'Error loading recommendations',
        },
        searchResponseId: null,
      };
      const element = createTestComponent();
      await flushPromises();

      const loadingPlaceholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );

      expect(loadingPlaceholder).toBeNull();
    });
  });

  describe('controller initialization', () => {
    it('should build the RecommendationList controller and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionMocks.buildRecommendationList).toHaveBeenCalledTimes(1);
      expect(functionMocks.buildRecommendationList).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            id: defaultOptions.recommendation,
            numberOfRecommendations: defaultOptions.numberOfRecommendations,
          },
        }
      );
      expect(functionMocks.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should build the ResultTemplatesManager controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionMocks.buildResultTemplatesManager).toHaveBeenCalledTimes(
        1
      );
      expect(functionMocks.buildResultTemplatesManager).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should dispatch quantic__registerrecommendationtemplates event', async () => {
      const mockEventHandler = jest.fn();
      document.addEventListener(
        'quantic__registerrecommendationtemplates',
        // @ts-ignore
        (event) => mockEventHandler(event.detail),
        {once: true}
      );
      createTestComponent();

      await flushPromises();

      expect(mockEventHandler).toHaveBeenCalledTimes(1);
      expect(mockEventHandler).toHaveBeenCalledWith({
        registerTemplates: functionMocks.registerTemplates,
      });
    });

    it('should register the fields to include', async () => {
      const expectedFormattedFieldsToInclude = ['field1', 'field2'];
      createTestComponent();
      await flushPromises();

      expect(functionMocks.loadFieldActions).toHaveBeenCalledTimes(1);
      expect(functionMocks.loadFieldActions).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionMocks.dispatch).toHaveBeenCalledTimes(1);
      expect(functionMocks.dispatch).toHaveBeenCalledWith(
        functionMocks.registerFieldsToInclude(expectedFormattedFieldsToInclude)
      );
    });

    describe('with custom #numberOfRecommendations option', () => {
      it('should build the buildRecommendationList controller with the custom number of recommendation value', async () => {
        createTestComponent({
          ...defaultOptions,
          numberOfRecommendations: 5,
        });
        await flushPromises();

        expect(functionMocks.buildRecommendationList).toHaveBeenCalledTimes(1);
        expect(functionMocks.buildRecommendationList).toHaveBeenCalledWith(
          exampleEngine,
          {
            options: {
              id: defaultOptions.recommendation,
              numberOfRecommendations: 5,
            },
          }
        );
      });
    });

    describe('when invalid property values are passed', () => {
      const expectedInvalidPropertyErrorMessage =
        'The value of the recommendationsPerRow property must be an integer greater than 0.';

      beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error');
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      it('should diplay an error message when recommendationsPerRow is not a number', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          recommendationsPerRow: 'invalid',
        });
        await flushPromises();

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          expectedInvalidPropertyErrorMessage
        );
      });

      it('should diplay an error message when recommendationsPerRow is a negative number', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          recommendationsPerRow: -1,
        });
        await flushPromises();

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          expectedInvalidPropertyErrorMessage
        );
      });
    });
  });

  describe('when an initialization error occurs', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
    });

    it('should display the error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      const initializationError = element.shadowRoot.querySelector(
        selectors.initializationError
      );

      expect(initializationError).not.toBeNull();
    });
  });

  describe('when the component is initialized successfully', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    describe('when there are no recommendations', () => {
      it('should not display a recommendation list', async () => {
        recommendationListState = {
          isLoading: false,
          recommendations: [],
          error: null,
          searchResponseId: null,
        };
        const element = createTestComponent();
        await flushPromises();

        const recommendationContainer = element.shadowRoot.querySelector(
          selectors.gridContainer
        );

        expect(recommendationContainer).toBeNull();
        const recommendationListElements = element.shadowRoot.querySelectorAll(
          selectors.recommendationListItem
        );
        expect(recommendationListElements.length).toBe(0);
      });
    });

    describe('when there are recommendations', () => {
      describe('when the variant value is #grid', () => {
        it('should properly display the recommendations as a grid', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            variant: 'grid',
          });
          await flushPromises();

          const recommendationContainer = element.shadowRoot.querySelector(
            selectors.gridContainer
          );
          const recommendationItems = element.shadowRoot.querySelectorAll(
            selectors.recommendationListResult
          );

          expect(recommendationContainer).not.toBeNull();
          expect(recommendationItems.length).toBe(recommendationsArray.length);
          recommendationItems.forEach((item, index) => {
            expect(item.result).toEqual(
              expect.objectContaining(recommendationsArray[index])
            );
            expect(item.engineId).toBe(defaultOptions.engineId);
            expect(item.resultTemplatesManager).toEqual(
              functionMocks.buildResultTemplatesManager()
            );
          });
        });

        describe('with a custom #recommendationsPerRow option', () => {
          const customRecommendationsPerRow = 2;
          it('should set the width of the recommendation items based on the number of #recommendationsPerRow value', async () => {
            const expectedRecommendationWidth = `${100 / customRecommendationsPerRow}%`;
            const element = createTestComponent({
              ...defaultOptions,
              variant: 'grid',
              recommendationsPerRow: customRecommendationsPerRow,
            });
            await flushPromises();

            expect(element.style._values['--recommendationItemWidth']).toBe(
              expectedRecommendationWidth
            );
          });
        });
      });

      describe('when the variant value is #carousel', () => {
        it('should properly display the recommendations as a carousel', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            variant: 'carousel',
          });
          await flushPromises();

          const recommendationContainer = element.shadowRoot.querySelector(
            selectors.carouselContainer
          );

          expect(recommendationContainer).not.toBeNull();
          expect(recommendationContainer.label).toBe(defaultOptions.label);
          expect(recommendationContainer.itemsPerPage).toBe(
            defaultOptions.recommendationsPerRow
          );

          const recommendationItems = element.shadowRoot.querySelectorAll(
            selectors.recommendationListResult
          );

          recommendationItems.forEach((item, index) => {
            expect(item.result).toEqual(
              expect.objectContaining(recommendationsArray[index])
            );
            expect(item.engineId).toBe(defaultOptions.engineId);
            expect(item.resultTemplatesManager).toEqual(
              functionMocks.buildResultTemplatesManager()
            );
          });
        });

        describe('with a custom #recommendationsPerRow option', () => {
          const customRecommendationsPerRow = 2;
          it('should pass the #recommendationsPerRow value to the carousel #itemsPerPage property', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              variant: 'carousel',
              recommendationsPerRow: customRecommendationsPerRow,
            });
            await flushPromises();
            const carousel = element.shadowRoot.querySelector(
              selectors.carouselContainer
            );

            expect(carousel).not.toBeNull();
            expect(carousel.itemsPerPage).toBe(customRecommendationsPerRow);
          });
        });
      });

      it('should properly pass the custom #label to the heading', async () => {
        const customLabel = 'Custom label';
        const element = createTestComponent({
          ...defaultOptions,
          variant: 'carousel',
          label: customLabel,
        });
        await flushPromises();

        const headingElement = element.shadowRoot.querySelector(
          selectors.quanticHeading
        );

        expect(headingElement).not.toBeNull();
        expect(headingElement.label).toBe(customLabel);
      });
    });
  });
});
