/* eslint-disable no-import-assign */
import QuanticRefineModalContent from 'c/quanticRefineModalContent';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');

const exampleEngine = {
  id: 'example engine id',
};

const defaultOptions = {
  engineId: exampleEngine.id,
  disableDynamicNavigation: false,
};

const createTestComponent = buildCreateTestComponent(
  QuanticRefineModalContent,
  'c-quantic-refine-modal-content',
  defaultOptions
);

const selectors = {
  initializationError: 'c-quantic-component-error',
  quanticFacet: 'c-quantic-facet',
  quanticCategoryFacet: 'c-quantic-category-facet',
  quanticNumericFacet: 'c-quantic-numeric-facet',
  quanticTimeframeFacet: 'c-quantic-timeframe-facet',
  quanticDateFacet: 'c-quantic-date-facet',
  quanticFacetCaption: 'c-quantic-facet-caption',
  quanticTimeframe: 'c-quantic-timeframe',
  quanticSort: 'c-quantic-sort',
  quanticSortOption: 'c-quantic-sort-option',
  clearActiveFiltersButton: '[data-testid="clear-active-filters-button"]',
  filtersTitle: '[data-testid="filters-title"]',
};

const initialSearchStatusState = {
  hasError: false,
};
let searchStatusState = initialSearchStatusState;

const initialBreadcrumbManagerState = {};
let breadcrumbManagerState = initialBreadcrumbManagerState;

const functionsMocks = {
  buildBreadcrumbManager: jest.fn(() => ({
    state: breadcrumbManagerState,
    subscribe: functionsMocks.breadcrumbManagerStateSubscriber,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  breadcrumbManagerStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.breadcrumbManagerStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  breadcrumbManagerStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  retry: jest.fn(),
};

let isInitialized = false;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildBreadcrumbManager: functionsMocks.buildBreadcrumbManager,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function setupMockFacetsDataInQuanticStore(facetData) {
  // @ts-ignore
  mockHeadlessLoader.getAllFacetsFromStore = () => {
    return facetData;
  };
}

function setupMockSortDataInQuanticStore(sortData) {
  // @ts-ignore
  mockHeadlessLoader.getAllSortOptionsFromStore = () => {
    return sortData;
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRefineModalContent && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticRefineModalContent) {
      element.setInitializationError();
    }
  };
}

const exampleFacetAttributes = {
  facetId: 'filetype',
  field: 'filetype',
  label: 'File Type',
  numberOfValues: '8',
  sortCriteria: 'occurrences',
  noSearch: 'true',
  displayValuesAs: 'link',
  noFilterFacetCount: 'false',
  injectionDepth: '1000',
  customSort: 'YouTubeVideo,PDF,HTML',
  dependsOn: '',
};

const exampleCategoryFacetAttributes = {
  facetId: 'country',
  field: 'country',
  label: 'Country',
  basePath: 'North America',
  noFilterByBasePath: 'false',
  noFilterFacetCount: 'false',
  delimitingCharacter: '>',
  numberOfValues: '10',
  sortCriteria: 'alphanumeric',
  withSearch: 'true',
  dependsOn: '',
};

const exampleNumericFacetAttributes = {
  facetId: 'youtube likes',
  field: 'youtubelikes',
  label: 'Youtube Likes',
  numberOfValues: '8',
  sortCriteria: 'occurrences',
  rangeAlgorithm: '',
  withInput: 'true',
  dependsOn: '',
};

const exampleTimeframeFacetAttributes = {
  facetId: 'date',
  field: 'date',
  label: 'Date',
  noFilterFacetCount: true,
  injectionDepth: 100,
  withDatePicker: true,
  dependsOn: '',
};

const exampleDateFacetAttributes = {
  facetId: 'date',
  field: 'date',
  label: 'Date',
  numberOfValues: 8,
  dependsOn: '',
};

const exampleTimeframeAttributes = {
  period: 'past',
  unit: 'month',
  amount: 6,
  label: 'last 6 months',
};

const exampleSortOptionAttributes = {
  label: 'Views Descending',
  value: '@ytviewcount descending',
  criterion: {
    by: 'field',
    field: 'ytviewcount',
    order: 'descending',
  },
};

describe('c-quantic-refine-modal-content', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    isInitialized = false;
    searchStatusState = initialSearchStatusState;
    breadcrumbManagerState = initialBreadcrumbManagerState;
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

  describe('controller initialization', () => {
    it('should build the breadcrumb manager and search status controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();
      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless breadcrumb manager and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(
        functionsMocks.breadcrumbManagerStateSubscriber
      ).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });
  });

  [true, false].forEach((disableDynamicNavigationValue) => {
    describe(`when the dynamic navigation feature is ${disableDynamicNavigationValue ? 'disabled' : 'enabled'}`, () => {
      describe('standard facet', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockFacetsDataInQuanticStore({
            filetype: {
              label: 'File Type',
              facetId: 'filetype',
              element: {
                localName: 'c-quantic-facet',
                ...exampleFacetAttributes,
              },
              metadata: {
                customCaptions: [],
              },
            },
          });
        });

        it('should display the quantic facet with its attributes and without custom captions', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            disableDynamicNavigation: disableDynamicNavigationValue,
          });
          await flushPromises();

          const quanticFacet = element.shadowRoot.querySelector(
            selectors.quanticFacet
          );

          expect(quanticFacet).not.toBeNull();
          expect(quanticFacet.engineId).toBe(exampleEngine.id);
          Object.entries(exampleFacetAttributes).forEach(([key, value]) => {
            expect(quanticFacet[key]).toBe(value);
          });

          const quanticFacetCaption = element.shadowRoot.querySelector(
            selectors.quanticFacetCaption
          );

          expect(quanticFacetCaption).toBeNull();
        });

        describe('when a standard facet is registered in the store with custom captions', () => {
          const exampleCaption = {
            value: 'YouTubeVideo',
            caption: 'YouTube Video',
          };

          beforeEach(() => {
            mockSuccessfulHeadlessInitialization();
            prepareHeadlessState();
            setupMockFacetsDataInQuanticStore({
              filetype: {
                label: 'File Type',
                facetId: 'filetype',
                element: {
                  localName: 'c-quantic-facet',
                  ...exampleFacetAttributes,
                },
                metadata: {
                  customCaptions: [exampleCaption],
                },
              },
            });
          });

          it('should display the quantic facet with its custom captions and attributes', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            await flushPromises();

            const quanticFacet = element.shadowRoot.querySelector(
              selectors.quanticFacet
            );

            expect(quanticFacet).not.toBeNull();
            expect(quanticFacet.engineId).toBe(exampleEngine.id);

            const quanticFacetCaption = element.shadowRoot.querySelector(
              selectors.quanticFacetCaption
            );

            expect(quanticFacetCaption).not.toBeNull();
            expect(quanticFacetCaption.value).toBe(exampleCaption.value);
            expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
          });
        });
      });

      describe('category facet', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockFacetsDataInQuanticStore({
            country: {
              label: 'Country',
              facetId: 'country',
              element: {
                localName: 'c-quantic-category-facet',
                ...exampleCategoryFacetAttributes,
              },
              metadata: {
                customCaptions: [],
              },
            },
          });
        });

        it('should display the quantic category facet with its attributes and without custom captions', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            disableDynamicNavigation: disableDynamicNavigationValue,
          });
          await flushPromises();

          const quanticCategoryFacet = element.shadowRoot.querySelector(
            selectors.quanticCategoryFacet
          );

          expect(quanticCategoryFacet).not.toBeNull();
          expect(quanticCategoryFacet.engineId).toBe(exampleEngine.id);
          Object.entries(exampleCategoryFacetAttributes).forEach(
            ([key, value]) => {
              expect(quanticCategoryFacet[key]).toBe(value);
            }
          );

          const quanticFacetCaption = element.shadowRoot.querySelector(
            selectors.quanticFacetCaption
          );
          expect(quanticFacetCaption).toBeNull();
        });

        describe('when a category facet is registered in the store with custom captions', () => {
          const exampleCaption = {
            value: 'Ca',
            caption: 'Canada',
          };

          beforeEach(() => {
            mockSuccessfulHeadlessInitialization();
            prepareHeadlessState();
            setupMockFacetsDataInQuanticStore({
              country: {
                label: 'Country',
                facetId: 'country',
                element: {
                  localName: 'c-quantic-category-facet',
                  ...exampleCategoryFacetAttributes,
                },
                metadata: {
                  customCaptions: [exampleCaption],
                },
              },
            });
          });

          it('should display the quantic category facet with its custom captions', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            await flushPromises();

            const quanticCategoryFacet = element.shadowRoot.querySelector(
              selectors.quanticCategoryFacet
            );

            expect(quanticCategoryFacet).not.toBeNull();
            expect(quanticCategoryFacet.engineId).toBe(exampleEngine.id);

            const quanticFacetCaption = element.shadowRoot.querySelector(
              selectors.quanticFacetCaption
            );

            expect(quanticFacetCaption).not.toBeNull();
            expect(quanticFacetCaption.value).toBe(exampleCaption.value);
            expect(quanticFacetCaption.caption).toBe(exampleCaption.caption);
          });
        });
      });

      describe('numeric facet', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockFacetsDataInQuanticStore({
            filetype: {
              label: 'Youtube Likes',
              facetId: 'youtubelikes',
              element: {
                localName: 'c-quantic-numeric-facet',
                ...exampleNumericFacetAttributes,
              },
            },
          });
        });

        it('should display the quantic numeric facet with its attributes', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            disableDynamicNavigation: disableDynamicNavigationValue,
          });
          await flushPromises();

          const quanticNumericFacet = element.shadowRoot.querySelector(
            selectors.quanticNumericFacet
          );

          expect(quanticNumericFacet).not.toBeNull();
          expect(quanticNumericFacet.engineId).toBe(exampleEngine.id);
          Object.entries(exampleNumericFacetAttributes).forEach(
            ([key, value]) => {
              expect(quanticNumericFacet[key]).toBe(value);
            }
          );
        });
      });

      describe('timeframe facet', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockFacetsDataInQuanticStore({
            filetype: {
              label: 'Date',
              facetId: 'date',
              element: {
                localName: 'c-quantic-timeframe-facet',
                ...exampleTimeframeFacetAttributes,
              },
              metadata: {
                timeframes: [exampleTimeframeAttributes],
              },
            },
          });
        });

        it('should display the quantic timeframe facet with its attributes', async () => {
          const element = createTestComponent();
          await flushPromises();

          const quanticTimeframeFacet = element.shadowRoot.querySelector(
            selectors.quanticTimeframeFacet
          );

          expect(quanticTimeframeFacet).not.toBeNull();
          expect(quanticTimeframeFacet.engineId).toBe(exampleEngine.id);
          Object.entries(exampleTimeframeFacetAttributes).forEach(
            ([key, value]) => {
              expect(quanticTimeframeFacet[key]).toBe(value);
            }
          );

          const quanticTimeframe = element.shadowRoot.querySelector(
            selectors.quanticTimeframe
          );

          expect(quanticTimeframe).not.toBeNull();
          Object.entries(exampleTimeframeAttributes).forEach(([key, value]) => {
            expect(quanticTimeframe[key]).toBe(value);
          });
        });
      });

      describe('date facet', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockFacetsDataInQuanticStore({
            filetype: {
              label: 'Date',
              facetId: 'date',
              element: {
                localName: 'c-quantic-date-facet',
                ...exampleDateFacetAttributes,
              },
            },
          });
        });

        it('should display the quantic date facet with its attributes', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            disableDynamicNavigation: disableDynamicNavigationValue,
          });
          await flushPromises();

          const quanticDateFacet = element.shadowRoot.querySelector(
            selectors.quanticDateFacet
          );

          expect(quanticDateFacet).not.toBeNull();
          expect(quanticDateFacet.engineId).toBe(exampleEngine.id);
          Object.entries(exampleDateFacetAttributes).forEach(([key, value]) => {
            expect(quanticDateFacet[key]).toBe(value);
          });
        });
      });

      describe('the sort component', () => {
        beforeEach(() => {
          mockSuccessfulHeadlessInitialization();
          prepareHeadlessState();
          setupMockSortDataInQuanticStore([exampleSortOptionAttributes]);
        });

        it('should display the quantic sort component with its attributes', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            disableDynamicNavigation: disableDynamicNavigationValue,
          });
          await flushPromises();

          const quanticSort = element.shadowRoot.querySelector(
            selectors.quanticSort
          );

          expect(quanticSort).not.toBeNull();
          expect(quanticSort.engineId).toBe(exampleEngine.id);
          expect(quanticSort.variant).toBe('wide');

          const quanticSortOption = element.shadowRoot.querySelector(
            selectors.quanticSortOption
          );

          expect(quanticSortOption).not.toBeNull();
          Object.entries(exampleSortOptionAttributes).forEach(
            ([key, value]) => {
              expect(quanticSortOption[key]).toEqual(value);
            }
          );
        });
      });

      describe('the clear all filters button', () => {
        describe('when there are active filters', () => {
          beforeEach(() => {
            setupMockFacetsDataInQuanticStore({
              filetype: {
                label: 'File Type',
                facetId: 'filetype',
                element: {
                  localName: 'c-quantic-facet',
                  ...exampleFacetAttributes,
                },
                metadata: {
                  customCaptions: [],
                },
              },
            });
            breadcrumbManagerState = {
              ...breadcrumbManagerState,
              hasBreadcrumbs: true,
            };
          });

          it('should display the clear all filters button', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            await flushPromises();

            const clearActiveFiltersButton = element.shadowRoot.querySelector(
              selectors.clearActiveFiltersButton
            );

            expect(clearActiveFiltersButton).not.toBeNull();
          });
        });

        describe('when there are no active filters', () => {
          beforeEach(() => {
            setupMockFacetsDataInQuanticStore({
              filetype: {
                label: 'File Type',
                facetId: 'filetype',
                element: {
                  localName: 'c-quantic-facet',
                  ...exampleFacetAttributes,
                },
                metadata: {
                  customCaptions: [],
                },
              },
            });
            breadcrumbManagerState = {
              ...breadcrumbManagerState,
              hasBreadcrumbs: false,
            };
          });

          it('should not display the clear all filters button', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            await flushPromises();

            const clearActiveFiltersButton = element.shadowRoot.querySelector(
              selectors.clearActiveFiltersButton
            );

            expect(clearActiveFiltersButton).toBeNull();
          });
        });
      });

      describe('the filters title', () => {
        beforeEach(() => {
          setupMockFacetsDataInQuanticStore({
            filetype: {
              label: 'File Type',
              facetId: 'filetype',
              element: {
                localName: 'c-quantic-facet',
                ...exampleFacetAttributes,
              },
              metadata: {
                customCaptions: [],
              },
            },
          });
          breadcrumbManagerState = {
            ...breadcrumbManagerState,
            hasBreadcrumbs: true,
          };
        });

        describe('when hideSort is set to false and a facet is rendered', () => {
          it('should display the filters title', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              hideSort: false,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
              detail: {
                id: 'filetype',
                shouldRenderFacet: true,
              },
            });
            element.dispatchEvent(renderFacetEvent);

            await flushPromises();

            const filtersTitle = element.shadowRoot.querySelector(
              selectors.filtersTitle
            );

            expect(filtersTitle).not.toBeNull();
          });
        });

        describe('when hideSort is set to true and a facet is rendered', () => {
          it('should not display the filters title', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              hideSort: true,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
              detail: {
                id: 'filetype',
                shouldRenderFacet: true,
              },
            });
            element.dispatchEvent(renderFacetEvent);

            await flushPromises();

            const filtersTitle = element.shadowRoot.querySelector(
              selectors.filtersTitle
            );

            expect(filtersTitle).toBeNull();
          });
        });

        describe('when no facet is rendered', () => {
          it('should not display the filters title', async () => {
            const element = createTestComponent({
              ...defaultOptions,
              disableDynamicNavigation: disableDynamicNavigationValue,
            });
            await flushPromises();

            const filtersTitle = element.shadowRoot.querySelector(
              selectors.filtersTitle
            );

            expect(filtersTitle).toBeNull();
          });
        });
      });
    });
  });
});
