/* eslint-disable no-import-assign */
import QuanticCategoryFacet from 'c/quanticCategoryFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  regexEncode: jest.fn(),
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
    getLabelNameWithCount: jest.fn(),
  },
}));
jest.mock('c/quanticHeadlessLoader');

const selectors = {
  facetContent: '[data-testid="facet-content"]',
  componentError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  cardContainer: 'c-quantic-card-container',
  facetValue: 'c-quantic-category-facet-value[data-testid="facet-value"]',
  facetValueNoActiveParent:
    'c-quantic-category-facet-value[data-testid="no-active-parent-facet-value"]',
  activeParent: '[data-testid="facet__active-parent"]',
  facetSearchValue:
    'c-quantic-category-facet-value[data-testid="facet-search-value"]',
  allCategoriesButton: '[data-testid="facet__all-categories__button"]',
  facetSearchboxInput: '[data-testid="facet__searchbox-input"]',
  facetSearchNoMatch: '[data-testid="facet-search__no-match"]',
  facetSearchMoreMatches: '[data-testid="facet-search__more-matches"]',
  facetValuesShowLess: '[data-testid="facet-values__show-less"]',
  facetValuesShowMore: '[data-testid="facet-values__show-more"]',
  facetBody: '[data-testid="facet__body"]',
  facetCollapseToggle: 'lightning-button-icon',
};

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const exampleEngineId = 'exampleEngineId';

const exampleFacetValues = [
  {
    value: 'North America',
    state: 'idle',
    numberOfResults: 112,
    children: [],
    path: ['North America'],
    isLeafValue: false,
  },
  {
    value: 'Africa',
    state: 'idle',
    numberOfResults: 58,
    children: [],
    path: ['Africa'],
    isLeafValue: false,
  },
];

const defaultOptions = {
  engineId: exampleEngineId,
  field: exampleField,
  facetId: exampleFacetId,
  delimitingCharacter: ';',
  numberOfValues: 10,
  sortCriteria: 'occurrences',
  basePath: '',
  noFilterByBasePath: false,
  noFilterFacetCount: false,
  label: 'example label',
};
const parentFacetIdError = `The ${exampleField} c-quantic-category-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-category-facet requires dependsOn.expectedValue to be a valid string.`;

const initialFacetState = {
  facetId: exampleFacetId,
  valuesAsTrees: [],
  enabled: true,
  facetSearch: {},
};
let facetState = initialFacetState;

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const createTestComponent = buildCreateTestComponent(
  QuanticCategoryFacet,
  'c-quantic-category-facet',
  defaultOptions
);

const functionsMocks = {
  buildCategoryFacet: jest.fn(() => ({
    subscribe: functionsMocks.facetStateSubscriber,
    state: facetState,
    deselectAll: functionsMocks.deselectAll,
    toggleSelect: functionsMocks.toggleSelect,
    showLessValues: functionsMocks.showLessValues,
    showMoreValues: functionsMocks.showMoreValues,
    facetSearch: {
      updateText: functionsMocks.updateText,
      search: functionsMocks.search,
      select: functionsMocks.select,
    },
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
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  facetStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  deselectAll: jest.fn(),
  toggleSelect: jest.fn(),
  select: jest.fn(),
  registerToStore: jest.fn(),
  eventHandler: jest.fn(),
  updateText: jest.fn(),
  search: jest.fn(),
  showLessValues: jest.fn(),
  showMoreValues: jest.fn(),
};

// @ts-ignore
mockHeadlessLoader.registerToStore = functionsMocks.registerToStore;

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

const exampleEngine = {
  id: exampleEngineId,
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

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticCategoryFacet) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-category-facet', () => {
  beforeEach(() => {
    prepareHeadlessState();
    mockSuccessfulHeadlessInitialization();
    mockBueno();
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
    searchStatusState = initialSearchStatusState;
    facetState = initialFacetState;
  });

  describe('component initialization', () => {
    it('should initialize the facet controller and the search status controller', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: defaultOptions.field,
            facetId: defaultOptions.facetId,
            sortCriteria: defaultOptions.sortCriteria,
            numberOfValues: defaultOptions.numberOfValues,
            delimitingCharacter: defaultOptions.delimitingCharacter,
            basePath: [],
            filterFacetCount: !defaultOptions.noFilterFacetCount,
            filterByBasePath: !defaultOptions.noFilterByBasePath,
          }),
        })
      );
    });

    it('should register the facet to the quantic store', async () => {
      const expectedFacetType = 'categoryFacets';
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

    it('should subscribe to the headless category facet state and search status state changes', async () => {
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

        expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledTimes(1);
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

        expect(functionsMocks.buildCategoryFacet).toHaveBeenCalledTimes(1);
        expect(
          functionsMocks.buildFacetConditionsManager
        ).toHaveBeenCalledTimes(0);
        expect(generateFacetDependencyConditions).toHaveBeenCalledTimes(0);
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
          valuesAsTrees: exampleFacetValues,
        };
      });

      it('should display the facet card', async () => {
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).not.toBeNull();
        expect(cardContainer.title).toBe(defaultOptions.label);
      });

      it('should display the facet values', async () => {
        const element = createTestComponent();
        await flushPromises();

        const facetValueElements = element.shadowRoot.querySelectorAll(
          selectors.facetValue
        );
        expect(facetValueElements.length).toBe(exampleFacetValues.length);
        exampleFacetValues.forEach((facetValue, index) => {
          expect(facetValueElements[index].item).toEqual(facetValue);
          expect(facetValueElements[index].activeParent).toBeUndefined();
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
              value: selection.value,
            },
          })
        );
        await flushPromises();

        expect(functionsMocks.toggleSelect).toHaveBeenCalledTimes(1);
        expect(functionsMocks.toggleSelect).toHaveBeenCalledWith(selection);
      });

      describe('when a facet value has an active parent nested under a non-active parent', () => {
        const exampleFacetValue = {
          value: 'example facet value',
          state: 'idle',
          numberOfResults: 1,
          children: [],
          path: ['non active parent', 'active parent', 'example facet value'],
          isLeafValue: true,
        };

        const exampleActiveParent = {
          value: 'active parent',
          state: 'selected',
          numberOfResults: 10,
          children: [exampleFacetValue],
          moreValuesAvailable: false,
          path: ['non active parent', 'active parent'],
          isLeafValue: false,
        };

        const exampleNonActiveParent = {
          value: 'non active parent',
          state: 'idle',
          numberOfResults: 100,
          children: [exampleActiveParent],
          path: ['non active parent'],
          isLeafValue: false,
        };

        beforeEach(() => {
          facetState = {
            ...initialFacetState,
            activeValue: exampleActiveParent,
            selectedValueAncestry: [
              exampleNonActiveParent,
              exampleActiveParent,
            ],
            valuesAsTrees: [exampleNonActiveParent],
          };
        });

        it('should display the all categories button', async () => {
          const element = createTestComponent();
          await flushPromises();

          const allCategoriesButton = element.shadowRoot.querySelector(
            selectors.allCategoriesButton
          );

          expect(allCategoriesButton).not.toBeNull();
        });

        describe('when the all categories button is clicked', () => {
          it('should call the deselectAll method of the controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            const allCategoriesButton = element.shadowRoot.querySelector(
              selectors.allCategoriesButton
            );
            await allCategoriesButton.click();

            expect(functionsMocks.deselectAll).toHaveBeenCalledTimes(1);
          });
        });

        it('should display the non active parent of the facet values', async () => {
          const element = createTestComponent();
          await flushPromises();

          const nonActiveParents = element.shadowRoot.querySelectorAll(
            selectors.facetValueNoActiveParent
          );

          expect(nonActiveParents.length).toBe(1);
          expect(nonActiveParents[0].item).toEqual(
            expect.objectContaining(exampleNonActiveParent)
          );
          expect(nonActiveParents[0].nonActiveParent).toBe('true');
        });

        describe('when the non active parent is clicked', () => {
          it('should call the toggleSelect method of the controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            const nonActiveParents = element.shadowRoot.querySelectorAll(
              selectors.facetValueNoActiveParent
            );
            nonActiveParents[0].dispatchEvent(
              new CustomEvent('quantic__selectvalue', {
                bubbles: true,
                detail: {
                  value: exampleNonActiveParent.value,
                },
              })
            );

            expect(functionsMocks.toggleSelect).toHaveBeenCalledTimes(1);
            expect(functionsMocks.toggleSelect).toHaveBeenCalledWith(
              exampleNonActiveParent
            );
          });
        });

        it('should display the active parent of the facet values', async () => {
          const element = createTestComponent();
          await flushPromises();

          const activeParent = element.shadowRoot.querySelector(
            selectors.activeParent
          );

          expect(activeParent).not.toBeNull();
          expect(activeParent.textContent).toBe(
            `${exampleActiveParent.value}(${exampleActiveParent.numberOfResults})`
          );
        });

        it('should display the facet values', async () => {
          const element = createTestComponent();
          await flushPromises();

          const facetValues = element.shadowRoot.querySelectorAll(
            selectors.facetValue
          );

          expect(facetValues.length).toBe(1);
          expect(facetValues[0].item).toEqual(
            expect.objectContaining(exampleFacetValue)
          );
          expect(facetValues[0].nonActiveParent).toBeFalsy();
        });

        describe('when the facet value is clicked', () => {
          it('should call the deselectAll method of the controller', async () => {
            const element = createTestComponent();
            await flushPromises();

            const facetValues = element.shadowRoot.querySelectorAll(
              selectors.facetValue
            );
            facetValues[0].dispatchEvent(
              new CustomEvent('quantic__selectvalue', {
                bubbles: true,
                detail: {
                  value: exampleFacetValue.value,
                },
              })
            );

            expect(functionsMocks.toggleSelect).toHaveBeenCalledTimes(1);
            expect(functionsMocks.toggleSelect).toHaveBeenCalledWith(
              exampleFacetValue
            );
          });
        });
      });

      describe('when the property withSearch is set to true', () => {
        it('should display the search input', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });
          await flushPromises();

          const facetSearchboxInput = element.shadowRoot.querySelector(
            selectors.facetSearchboxInput
          );
          expect(facetSearchboxInput).not.toBeNull();
        });

        it('should call the updateText method and the search of the facet search controller when the input value changes', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });

          await flushPromises();

          const facetSearchboxInput = element.shadowRoot.querySelector(
            selectors.facetSearchboxInput
          );
          facetSearchboxInput.value = 'test';
          facetSearchboxInput.dispatchEvent(
            new CustomEvent('change', {
              bubbles: true,
            })
          );

          expect(functionsMocks.updateText).toHaveBeenCalledTimes(1);
          expect(functionsMocks.updateText).toHaveBeenCalledWith('test');
          expect(functionsMocks.search).toHaveBeenCalledTimes(1);
        });

        describe('when the search input contains a value', () => {
          describe('when facet search values are available', () => {
            const exampleFacetSearchValues = [
              {
                displayValue: 'value one',
                rawValue: 'valueOne',
                count: 1,
                path: ['example parent one'],
              },
              {
                displayValue: 'value two',
                rawValue: 'valueTwo',
                count: 1,
                path: ['example parent two'],
              },
            ];

            beforeEach(() => {
              facetState = {
                ...facetState,
                facetSearch: {
                  values: exampleFacetSearchValues,
                },
              };
            });

            it('should display facet search values', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                withSearch: true,
              });
              await flushPromises();
              const facetSearchboxInput = element.shadowRoot.querySelector(
                selectors.facetSearchboxInput
              );
              facetSearchboxInput.value = 'test';
              await flushPromises();

              const facetSearchValueElements =
                element.shadowRoot.querySelectorAll(selectors.facetSearchValue);
              expect(facetSearchValueElements.length).toBe(
                exampleFacetSearchValues.length
              );
              exampleFacetSearchValues.forEach((facetValue, index) => {
                expect(facetSearchValueElements[index].item).toEqual(
                  expect.objectContaining({
                    value: facetValue.rawValue,
                    numberOfResults: facetValue.count,
                    path: facetValue.path,
                    highlightedResult: facetValue.displayValue,
                  })
                );
              });
            });

            it('should not display the facet search no match label', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                withSearch: true,
              });
              await flushPromises();
              const facetSearchboxInput = element.shadowRoot.querySelector(
                selectors.facetSearchboxInput
              );
              facetSearchboxInput.value = 'test';
              await flushPromises();

              const facetSearchNoMatch = element.shadowRoot.querySelector(
                selectors.facetSearchNoMatch
              );
              expect(facetSearchNoMatch).toBeNull();
            });

            it('should call the controller function select when clicking a facet search value', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                withSearch: true,
              });
              const selectedIndex = 0;
              await flushPromises();
              const facetSearchboxInput = element.shadowRoot.querySelector(
                selectors.facetSearchboxInput
              );
              facetSearchboxInput.value = 'test';
              await flushPromises();

              const facetSearchValueElements =
                element.shadowRoot.querySelectorAll(selectors.facetSearchValue);

              const selection = exampleFacetSearchValues[selectedIndex];
              facetSearchValueElements[selectedIndex].dispatchEvent(
                new CustomEvent('quantic__selectvalue', {
                  bubbles: true,
                  detail: {
                    value: selection.rawValue,
                  },
                })
              );
              await flushPromises();

              expect(functionsMocks.select).toHaveBeenCalledTimes(1);
              expect(functionsMocks.select).toHaveBeenCalledWith({
                count: selection.count,
                path: selection.path,
                rawValue: selection.rawValue,
                displayValue: selection.rawValue,
              });
            });

            describe('when more facet search values are available', () => {
              beforeEach(() => {
                facetState = {
                  ...facetState,
                  facetSearch: {
                    values: exampleFacetSearchValues,
                    moreValuesAvailable: true,
                  },
                };
              });

              it('should display the facet search more matches message', async () => {
                const element = createTestComponent({
                  ...defaultOptions,
                  withSearch: true,
                });
                await flushPromises();
                const facetSearchboxInput = element.shadowRoot.querySelector(
                  selectors.facetSearchboxInput
                );
                facetSearchboxInput.value = 'test';
                await flushPromises();

                const facetSearchMoreMatches = element.shadowRoot.querySelector(
                  selectors.facetSearchMoreMatches
                );
                expect(facetSearchMoreMatches).not.toBeNull();
              });
            });

            describe('when canShowMoreValues is set to true in the state', () => {
              beforeEach(() => {
                facetState = {
                  ...facetState,
                  facetSearch: {
                    values: exampleFacetSearchValues,
                  },
                  canShowMoreValues: true,
                };
              });

              it('should not display the facet show more button', async () => {
                const element = createTestComponent({
                  ...defaultOptions,
                  withSearch: true,
                });
                await flushPromises();
                const facetSearchboxInput = element.shadowRoot.querySelector(
                  selectors.facetSearchboxInput
                );
                facetSearchboxInput.value = 'test';
                await flushPromises();

                const facetValuesShowMore = element.shadowRoot.querySelector(
                  selectors.facetValuesShowMore
                );
                expect(facetValuesShowMore).toBeNull();
              });
            });

            describe('when canShowLessValues is set to true in the state', () => {
              beforeEach(() => {
                facetState = {
                  ...facetState,
                  facetSearch: {
                    values: exampleFacetSearchValues,
                  },
                  canShowLessValues: true,
                };
              });

              it('should not display the facet show less button', async () => {
                const element = createTestComponent({
                  ...defaultOptions,
                  withSearch: true,
                });
                await flushPromises();
                const facetSearchboxInput = element.shadowRoot.querySelector(
                  selectors.facetSearchboxInput
                );
                facetSearchboxInput.value = 'test';
                await flushPromises();

                const facetValuesShowLess = element.shadowRoot.querySelector(
                  selectors.facetValuesShowLess
                );
                expect(facetValuesShowLess).toBeNull();
              });
            });
          });

          describe('when facet search values are not available', () => {
            beforeEach(() => {
              facetState = {
                ...facetState,
                facetSearch: {
                  values: [],
                },
              };
            });

            it('should not display any facet search values', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                withSearch: true,
              });
              await flushPromises();
              const facetSearchboxInput = element.shadowRoot.querySelector(
                selectors.facetSearchboxInput
              );
              facetSearchboxInput.value = 'test';
              await flushPromises();

              const facetSearchValueElements =
                element.shadowRoot.querySelectorAll(selectors.facetSearchValue);
              expect(facetSearchValueElements.length).toBe(0);
            });

            it('should display the facet search no match label', async () => {
              const element = createTestComponent({
                ...defaultOptions,
                withSearch: true,
              });
              await flushPromises();
              const facetSearchboxInput = element.shadowRoot.querySelector(
                selectors.facetSearchboxInput
              );
              facetSearchboxInput.value = 'test';
              await flushPromises();

              const facetSearchNoMatch = element.shadowRoot.querySelector(
                selectors.facetSearchNoMatch
              );
              expect(facetSearchNoMatch).not.toBeNull();
            });
          });
        });
      });

      describe('when canShowLessValues is set to true in the state', () => {
        beforeEach(() => {
          facetState = {
            ...facetState,
            canShowLessValues: true,
          };
        });

        it('should display the facet show less button', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });
          await flushPromises();

          const facetValuesShowLess = element.shadowRoot.querySelector(
            selectors.facetValuesShowLess
          );
          expect(facetValuesShowLess).not.toBeNull();
        });

        it('should call the controller function showLessValues when the facet show less button is clicked', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });
          await flushPromises();

          const facetValuesShowLess = element.shadowRoot.querySelector(
            selectors.facetValuesShowLess
          );
          facetValuesShowLess.click();

          expect(functionsMocks.showLessValues).toHaveBeenCalledTimes(1);
        });
      });

      describe('when canShowMoreValues is set to true in the state', () => {
        beforeEach(() => {
          facetState = {
            ...facetState,
            canShowMoreValues: true,
          };
        });

        it('should display the facet show more button', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });
          await flushPromises();

          const facetValuesShowMore = element.shadowRoot.querySelector(
            selectors.facetValuesShowMore
          );
          expect(facetValuesShowMore).not.toBeNull();
        });

        it('should call the controller function showMoreValues when the facet show more button is clicked', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            withSearch: true,
          });
          await flushPromises();

          const facetValuesShowMore = element.shadowRoot.querySelector(
            selectors.facetValuesShowMore
          );
          facetValuesShowMore.click();

          expect(functionsMocks.showMoreValues).toHaveBeenCalledTimes(1);
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
      });
    });

    describe('when the facet has no values', () => {
      beforeEach(() => {
        facetState = {
          ...initialFacetState,
          valuesAsTrees: [],
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
    });
  });
});
