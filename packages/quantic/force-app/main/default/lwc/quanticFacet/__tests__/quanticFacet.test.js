/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticFacet from 'c/quanticFacet';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {generateFacetDependencyConditions} from 'c/quanticUtils';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  generateFacetDependencyConditions: jest.fn(),
  regexEncode: jest.fn(),
  Store: {
    facetTypes: {
      FACETS: 'facets',
    },
  },
  I18nUtils: {
    format: jest.fn(),
    getLabelNameWithCount: jest.fn(),
  },
}));
jest.mock('c/quanticHeadlessLoader');

let isInitialized = false;

const exampleFacetId = 'example facet id';
const exampleField = 'exampleField';
const exampleFacetValues = [
  {value: 'example facet value', numberOfResults: 10},
  {value: 'another facet value', numberOfResults: 10},
];
const exampleFacetSearchValues = [
  {
    displayValue: 'example facet search value',
    rawValue: 'exampleFacetSearchValue',
    count: 10,
  },
];
const exampleEngine = {
  id: 'dummy engine',
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

const selectors = {
  facetContent: '[data-test="facet-content"]',
  componentError: 'c-quantic-component-error',
  initializationError: 'c-quantic-component-error',
  placeholder: 'c-quantic-placeholder',
  cardContainer: 'c-quantic-card-container',
  clearSelectionButton: '[data-testid="clear-selection-button"]',
  facetBody: '[data-testid="facet__body"]',
  searchboxInput: '[data-testid="facet__searchbox-input"]',
  facetValue: 'c-quantic-facet-value',
  facetValuesShowMore: '[data-testid="facet-values__show-more"]',
  facetValuesShowLess: '[data-testid="facet-values__show-less"]',
  facetSearchNoMatchMessage: '[data-testid="facet-search__no-match"]',
  facetSearchMoreMatchMessage: '[data-testid="facet-search__more-match"]',
  facetCollapseToggle: 'lightning-button-icon',
};

const defaultOptions = {
  engineId: exampleEngine.id,
  field: exampleField,
  facetId: exampleFacetId,
  sortCriteria: 'score',
  numberOfValues: 10,
  injectionDepth: 1000,
  customSort: ['test'],
  label: 'example label',
};
const parentFacetIdError = `The ${exampleField} c-quantic-facet requires dependsOn.parentFacetId to be a valid string.`;
const expectedValueError = `The ${exampleField} c-quantic-facet requires dependsOn.expectedValue to be a valid string.`;

const functionsMocks = {
  buildFacet: jest.fn(() => ({
    state: facetState,
    subscribe: functionsMocks.facetStateSubscriber,
    deselectAll: functionsMocks.deselectAll,
    showMoreValues: functionsMocks.showMoreValues,
    showLessValues: functionsMocks.showLessValues,
    toggleSingleSelect: functionsMocks.toggleSingleSelect,
    toggleSelect: functionsMocks.toggleSelect,
    facetSearch: {
      updateText: functionsMocks.updateText,
      singleSelect: functionsMocks.singleSelect,
      select: functionsMocks.select,
    },
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
  showMoreValues: jest.fn(),
  showLessValues: jest.fn(),
  singleSelect: jest.fn(),
  select: jest.fn(),
  toggleSingleSelect: jest.fn(),
  toggleSelect: jest.fn(),
  updateText: jest.fn(),
  registerToStore: jest.fn(),
  eventHandler: jest.fn(),
};

// @ts-ignore
mockHeadlessLoader.registerToStore = functionsMocks.registerToStore;

const createTestComponent = buildCreateTestComponent(
  QuanticFacet,
  'c-quantic-facet',
  defaultOptions
);

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => ({
    buildFacet: functionsMocks.buildFacet,
    buildSearchStatus: functionsMocks.buildSearchStatus,
    buildFacetConditionsManager: functionsMocks.buildFacetConditionsManager,
  });
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticFacet && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticFacet) {
      element.setInitializationError();
    }
  };
}

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

describe('c-quantic-facet', () => {
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

      expect(functionsMocks.buildFacet).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildFacet).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            field: exampleField,
            facetId: exampleFacetId,
            sortCriteria: defaultOptions.sortCriteria,
            numberOfValues: defaultOptions.numberOfValues,
            injectionDepth: defaultOptions.injectionDepth,
            customSort: defaultOptions.customSort,
          }),
        })
      );
    });

    it('should register the facet to the quantic store', async () => {
      const expectedFacetType = 'facets';
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
          metadata: {
            customCaptions: [],
          },
        })
      );
    });

    describe('the facet conditions manager controller', () => {
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

        expect(functionsMocks.buildFacet).toHaveBeenCalledTimes(1);
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

        expect(functionsMocks.buildFacet).toHaveBeenCalledTimes(1);
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

        const initializationError = element.shadowRoot.querySelector(
          selectors.initializationError
        );

        expect(initializationError).not.toBeNull();
      });
    });
  });

  describe('the facet enablement', () => {
    describe('when the facet is enabled', () => {
      beforeEach(() => {
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
      beforeEach(() => {
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
          values: [{value: 'example value', numberOfResults: 0}],
        };
        const element = createTestComponent();
        await flushPromises();

        const cardContainer = element.shadowRoot.querySelector(
          selectors.cardContainer
        );
        expect(cardContainer).toBeNull();
      });

      describe('when the facet has active values', () => {
        beforeEach(() => {
          facetState = {
            ...initialFacetState,
            values: [{value: 'example value', numberOfResults: 10}],
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
          expect(functionsMocks.updateText).toHaveBeenCalledTimes(1);
          expect(functionsMocks.updateText).toHaveBeenCalledWith('');
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
              values: [{value: 'example value', numberOfResults: 10}],
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

      describe('when the property noSearch is set to false', () => {
        describe('when there are no more facet values to show', () => {
          beforeEach(() => {
            facetState = {
              ...initialFacetState,
              values: exampleFacetValues,
              canShowMoreValues: false,
            };
          });

          it('should not display the facet search box input', async () => {
            const element = createTestComponent();
            await flushPromises();

            const searchboxInput = element.shadowRoot.querySelector(
              selectors.searchboxInput
            );
            expect(searchboxInput).toBeNull();
          });

          it('should display the facet values as standard facet values', async () => {
            const expectedFacetValues = exampleFacetValues.map(
              (facetValue) => ({
                ...facetValue,
                checked: false,
                highlightedResult: facetValue.value,
              })
            );
            const element = createTestComponent({
              ...defaultOptions,
              noSearch: true,
            });
            await flushPromises();

            const facetValueElements = element.shadowRoot.querySelectorAll(
              selectors.facetValue
            );
            expect(facetValueElements.length).toBe(expectedFacetValues.length);
            expectedFacetValues.forEach((facetValue, index) => {
              expect(facetValueElements[index].item).toEqual(facetValue);
            });
          });
        });

        describe('when there are more facet values to show', () => {
          beforeEach(() => {
            facetState = {
              ...initialFacetState,
              values: exampleFacetValues,
              canShowMoreValues: true,
              facetSearch: {
                values: exampleFacetSearchValues,
              },
            };
          });

          it('should display the facet search box input', async () => {
            const element = createTestComponent();
            await flushPromises();

            const searchboxInput = element.shadowRoot.querySelector(
              selectors.searchboxInput
            );
            expect(searchboxInput).not.toBeNull();
          });

          describe('when the facet search input is empty', () => {
            it('should display the facet values as standard facet values', async () => {
              const expectedFacetValues = exampleFacetValues.map(
                (facetValue) => ({
                  ...facetValue,
                  checked: false,
                  highlightedResult: facetValue.value,
                })
              );
              const element = createTestComponent();
              await flushPromises();

              const facetValueElements = element.shadowRoot.querySelectorAll(
                selectors.facetValue
              );
              expect(facetValueElements.length).toBe(
                expectedFacetValues.length
              );
              expectedFacetValues.forEach((facetValue, index) => {
                expect(facetValueElements[index].item).toEqual(facetValue);
              });
            });
          });

          describe('when the facet search input is not empty', () => {
            it('should display the facet values as facet search values', async () => {
              const expectedFacetValues = exampleFacetSearchValues.map(
                (facetValue) => ({
                  checked: false,
                  highlightedResult: facetValue.displayValue,
                  value: facetValue.rawValue,
                  numberOfResults: facetValue.count,
                  state: 'idle',
                })
              );
              const element = createTestComponent();
              await flushPromises();

              const searchboxInput = element.shadowRoot.querySelector(
                selectors.searchboxInput
              );
              searchboxInput.value = 'foo';
              await flushPromises();

              const facetValueElements = element.shadowRoot.querySelectorAll(
                selectors.facetValue
              );
              expect(facetValueElements.length).toBe(
                exampleFacetSearchValues.length
              );
              expectedFacetValues.forEach((facetValue, index) => {
                expect(facetValueElements[index].item).toEqual(facetValue);
              });
            });

            ['checkbox', 'link'].forEach((propertyValue) => {
              describe(`when the property displayValuesAs is set to "${propertyValue}"`, () => {
                it(`should display the facet search value as ${propertyValue}`, async () => {
                  const element = createTestComponent({
                    ...defaultOptions,
                    displayValuesAs: propertyValue,
                  });
                  await flushPromises();

                  const searchboxInput = element.shadowRoot.querySelector(
                    selectors.searchboxInput
                  );
                  searchboxInput.value = 'foo';
                  await flushPromises();

                  const facetValueElement = element.shadowRoot.querySelector(
                    selectors.facetValue
                  );
                  expect(facetValueElement.displayAsLink).toEqual(
                    propertyValue === 'link'
                  );
                });

                const expectedFunctionToBeCalled =
                  propertyValue === 'link' ? 'singleSelect' : 'select';

                it(`should call the controller function ${expectedFunctionToBeCalled} when clicked`, async () => {
                  const element = createTestComponent({
                    ...defaultOptions,
                    displayValuesAs: propertyValue,
                  });
                  const selectedIndex = 0;
                  await flushPromises();

                  const searchboxInput = element.shadowRoot.querySelector(
                    selectors.searchboxInput
                  );
                  searchboxInput.value = 'foo';
                  await flushPromises();

                  const facetValueElement = element.shadowRoot.querySelector(
                    selectors.facetValue
                  );
                  const selection = exampleFacetSearchValues[selectedIndex];
                  facetValueElement.dispatchEvent(
                    new CustomEvent('quantic__selectvalue', {
                      bubbles: true,
                      detail: {
                        value: selection.rawValue,
                      },
                    })
                  );
                  await flushPromises();

                  expect(
                    functionsMocks[expectedFunctionToBeCalled]
                  ).toHaveBeenCalledTimes(1);
                  expect(
                    functionsMocks[expectedFunctionToBeCalled]
                  ).toHaveBeenCalledWith(
                    expect.objectContaining({
                      ...selection,
                      displayValue: selection.rawValue,
                    })
                  );
                });
              });
            });
          });

          describe('when facet search does not have results', () => {
            beforeEach(() => {
              facetState = {
                ...initialFacetState,
                values: exampleFacetValues,
                canShowMoreValues: true,
                facetSearch: {
                  values: [],
                },
              };
            });

            it('should display the facet search no match message', async () => {
              const element = createTestComponent();
              await flushPromises();

              const searchboxInput = element.shadowRoot.querySelector(
                selectors.searchboxInput
              );
              searchboxInput.value = 'foo';
              await flushPromises();

              const facetSearchNoMatchMessage =
                element.shadowRoot.querySelector(
                  selectors.facetSearchNoMatchMessage
                );
              expect(facetSearchNoMatchMessage).not.toBeNull();
            });
          });

          describe('when more facet search values are available', () => {
            beforeEach(() => {
              facetState = {
                ...initialFacetState,
                values: exampleFacetValues,
                canShowMoreValues: true,
                facetSearch: {
                  moreValuesAvailable: true,
                  values: exampleFacetSearchValues,
                },
              };
            });

            it('should display the facet search more match message', async () => {
              const element = createTestComponent();
              await flushPromises();

              const searchboxInput = element.shadowRoot.querySelector(
                selectors.searchboxInput
              );
              searchboxInput.value = 'foo';
              await flushPromises();

              const facetSearchMoreMatchMessage =
                element.shadowRoot.querySelector(
                  selectors.facetSearchMoreMatchMessage
                );
              expect(facetSearchMoreMatchMessage).not.toBeNull();
            });
          });
        });
      });

      describe('when the property noSearch is set to true', () => {
        it('should not display the facet search box input', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            noSearch: true,
          });
          await flushPromises();

          const searchboxInput = element.shadowRoot.querySelector(
            selectors.searchboxInput
          );
          expect(searchboxInput).toBeNull();
        });

        describe('facet values', () => {
          it('should display the facet values', async () => {
            const expectedFacetValues = exampleFacetValues.map(
              (facetValue) => ({
                ...facetValue,
                checked: false,
                highlightedResult: facetValue.value,
              })
            );
            const element = createTestComponent({
              ...defaultOptions,
              noSearch: true,
            });
            await flushPromises();

            const facetValueElements = element.shadowRoot.querySelectorAll(
              selectors.facetValue
            );
            expect(facetValueElements.length).toBe(expectedFacetValues.length);
            expectedFacetValues.forEach((facetValue, index) => {
              expect(facetValueElements[index].item).toEqual(facetValue);
            });
          });

          describe('the show less facet values button', () => {
            [true, false].forEach((canShowLessValues) => {
              it(`should ${canShowLessValues ? '' : 'not'} display show less facet values button when the state indicates that it is ${canShowLessValues ? 'possible' : 'not possible'}`, async () => {
                facetState = {
                  ...initialFacetState,
                  values: exampleFacetValues,
                  canShowLessValues: canShowLessValues,
                };
                const element = createTestComponent({
                  ...defaultOptions,
                  noSearch: true,
                });
                await flushPromises();

                const facetValuesShowLess = element.shadowRoot.querySelector(
                  selectors.facetValuesShowLess
                );
                expect(facetValuesShowLess)[
                  canShowLessValues ? 'toBeTruthy' : 'toBeNull'
                ]();
              });
            });

            it('should call the controller function showLessValues when clicked', async () => {
              facetState = {
                ...initialFacetState,
                values: exampleFacetValues,
                canShowLessValues: true,
              };
              const element = createTestComponent({
                ...defaultOptions,
                noSearch: true,
              });
              await flushPromises();

              const facetValuesShowLess = element.shadowRoot.querySelector(
                selectors.facetValuesShowLess
              );
              facetValuesShowLess.click();
              await flushPromises();

              expect(functionsMocks.showLessValues).toHaveBeenCalledTimes(1);
            });
          });

          describe('the show more facet values button', () => {
            [true, false].forEach((canShowMoreValues) => {
              it(`should ${canShowMoreValues ? '' : 'not'} display show more facet values button when the state indicates that it is ${canShowMoreValues ? 'possible' : 'not possible'}`, async () => {
                facetState = {
                  ...initialFacetState,
                  values: exampleFacetValues,
                  canShowMoreValues,
                };
                const element = createTestComponent({
                  ...defaultOptions,
                  noSearch: true,
                });
                await flushPromises();

                const facetValuesShowMore = element.shadowRoot.querySelector(
                  selectors.facetValuesShowMore
                );
                expect(facetValuesShowMore)[
                  canShowMoreValues ? 'toBeTruthy' : 'toBeNull'
                ]();
              });
            });

            it('should call the controller function showMoreValues when clicked', async () => {
              facetState = {
                ...initialFacetState,
                values: exampleFacetValues,
                canShowMoreValues: true,
              };
              const element = createTestComponent({
                ...defaultOptions,
                noSearch: true,
              });
              await flushPromises();

              const facetValuesShowMore = element.shadowRoot.querySelector(
                selectors.facetValuesShowMore
              );
              facetValuesShowMore.click();
              await flushPromises();

              expect(functionsMocks.showMoreValues).toHaveBeenCalledTimes(1);
            });
          });

          ['checkbox', 'link'].forEach((propertyValue) => {
            describe(`when the property displayValuesAs is set to "${propertyValue}"`, () => {
              it(`should display the facet value as ${propertyValue}`, async () => {
                const element = createTestComponent({
                  ...defaultOptions,
                  noSearch: true,
                  displayValuesAs: propertyValue,
                });
                await flushPromises();

                const facetValueElement = element.shadowRoot.querySelector(
                  selectors.facetValue
                );
                expect(facetValueElement.displayAsLink).toEqual(
                  propertyValue === 'link'
                );
              });

              const expectedFunctionToBeCalled =
                propertyValue === 'link'
                  ? 'toggleSingleSelect'
                  : 'toggleSelect';

              it(`should call the controller function ${expectedFunctionToBeCalled} when clicked`, async () => {
                const element = createTestComponent({
                  ...defaultOptions,
                  noSearch: true,
                  displayValuesAs: propertyValue,
                });
                const selectedIndex = 0;
                await flushPromises();

                const facetValueElement = element.shadowRoot.querySelector(
                  selectors.facetValue
                );
                facetValueElement.dispatchEvent(
                  new CustomEvent('quantic__selectvalue', {
                    bubbles: true,
                    detail: {value: exampleFacetValues[selectedIndex].value},
                  })
                );
                await flushPromises();

                expect(
                  functionsMocks[expectedFunctionToBeCalled]
                ).toHaveBeenCalledTimes(1);
                expect(
                  functionsMocks[expectedFunctionToBeCalled]
                ).toHaveBeenCalledWith(
                  expect.objectContaining(exampleFacetValues[selectedIndex])
                );
              });
            });
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
