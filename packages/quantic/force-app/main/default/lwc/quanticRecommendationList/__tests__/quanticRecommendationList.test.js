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
  {
    title: 'Title 3',
    clickUri: 'https://example.com/3',
    excerpt: 'Excerpt 3',
  },
  {
    title: 'Title 4',
    clickUri: 'https://example.com/4',
    excerpt: 'Excerpt 4',
  },
];

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  ...jest.requireActual('c/quanticUtils'),
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
}));

let isInitialized = false;
let initialRecommendationListState = {
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
    console.error = jest.fn();
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
  });

  describe('controller initialization', () => {
    it('should build the buildRecommendationList controller with the proper parameters and subscribe to its state', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionMocks.buildRecommendationList).toHaveBeenCalledTimes(1);
      expect(functionMocks.buildRecommendationList).toHaveBeenCalledWith(
        exampleEngine,
        {
          options: {
            id: defaultOptions.recommendation,
            numberOfRecommendations: Number(
              defaultOptions.numberOfRecommendations
            ),
          },
        }
      );
    });

    it('should build the buildResultTemplatesManager controller with the proper parameters', async () => {
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
      const element = createTestComponent();
      await flushPromises();

      const event = new CustomEvent(
        'quantic__registerrecommendationtemplates',
        {
          bubbles: true,
          detail: {
            content: defaultOptions.recommendation,
            conditions: [],
          },
        }
      );
      element.shadowRoot.dispatchEvent(event);

      expect(functionMocks.registerTemplates).toHaveBeenCalledTimes(1);
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
              numberOfRecommendations: Number(5),
            },
          }
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
      });
    });

    describe('when there are recommendations', () => {
      describe.each([
        ['grid', selectors.gridContainer, selectors.recommendationListItem],
        [
          'carousel',
          selectors.carouselContainer,
          selectors.recommendationListItem,
        ],
      ])('with %s variant', (variant, containerSelector, itemSelector) => {
        beforeEach(() => {
          recommendationListState = {
            isLoading: false,
            recommendations: recommendationsArray,
            error: null,
            searchResponseId: '123',
          };
        });
        it('should properly display the recommendations with default options', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            variant,
          });
          await flushPromises();

          const recommendationContainer =
            element.shadowRoot.querySelector(containerSelector);
          const recommendationItems =
            element.shadowRoot.querySelectorAll(itemSelector);

          expect(recommendationContainer).not.toBeNull();
          if (variant === 'grid') {
            expect(recommendationItems.length).toBe(
              recommendationsArray.length
            );
          } else {
            expect(recommendationContainer.label).toEqual(defaultOptions.label);
            expect(recommendationContainer.itemsPerPage).toEqual(
              defaultOptions.recommendationsPerRow
            );
          }
        });

        describe('with a custom #recommendationsPerRow option', () => {
          const customRecommendationsPerRow = 2;
          if (variant === 'grid') {
            it('should set the width of the recommendation items based on the number of #recommendationsPerRow value', async () => {
              const expectedRecommendationWidth = `${100 / customRecommendationsPerRow}%`;
              const element = createTestComponent({
                ...defaultOptions,
                variant,
                recommendationsPerRow: 2,
              });
              await flushPromises();

              expect(
                element.style._values['--recommendationItemWidth']
              ).toEqual(expectedRecommendationWidth);
            });
          } else {
            it('should pass the #recommendationsPerRow value to the carousel #itemsPerPage property', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                variant,
                recommendationsPerRow: customRecommendationsPerRow,
              });
              await flushPromises();
              const carousel = element.shadowRoot.querySelector(
                selectors.carouselContainer
              );

              expect(carousel).not.toBeNull();
              expect(carousel.itemsPerPage).toEqual(
                customRecommendationsPerRow
              );
            });
          }
        });

        it('should properly pass the custom #label to the heading', async () => {
          const customLabel = 'Custom label';
          const element = createTestComponent({
            ...defaultOptions,
            variant,
            label: customLabel,
          });
          await flushPromises();

          const headingElement = element.shadowRoot.querySelector(
            selectors.quanticHeading
          );

          expect(headingElement).not.toBeNull();
          expect(headingElement.label).toEqual(customLabel);
        });
      });

      describe('when invalid property values are passed', () => {
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
        });
      });
    });
  });
});
