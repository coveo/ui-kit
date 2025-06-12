/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticRefineToggle from 'c/quanticRefineToggle';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {cleanup, buildCreateTestComponent, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  AriaLiveRegion: jest.fn(() => ({
    dispatchMessage: jest.fn(),
  })),
  loadMarkdownDependencies: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve();
      })
  ),
  I18nUtils: {
    format: jest.fn(),
  },
}));

/** @type {Object} */
const defaultOptions = {
  fieldsToIncludeInCitations: 'sfid,sfkbid,sfkavid',
  answerConfigurationId: undefined,
  withToggle: false,
  collapsible: false,
  maxCollapsedHeight: 250,
};

const createTestComponent = buildCreateTestComponent(
  QuanticRefineToggle,
  'c-quantic-refine-toggle',
  defaultOptions
);

const selectors = {
  initializationError: 'c-quantic-component-error',
  refineToggleButton: '[data-testid="refine-toggle__button"]',
  modal: '[data-testid="refine-toggle__modal"]',
  modalCloseButton: '[data-testid="refine-toggle__modal-close-button"]',
  modalViewResultsButton:
    '[data-testid="refine-toggle__modal-view-results-button"]',
  modalContent: '[data-testid="refine-toggle__modal-content"]',
  activeFiltersBadge: '[data-testid="refine-toggle__active-filters-badge"]',
};

const initialSearchStatusState = {
  hasError: false,
  hasResults: true,
};
let searchStatusState = initialSearchStatusState;

const initialQuerySummaryState = {};
let querySummaryState = initialQuerySummaryState;

const initialBreadcrumbManagerState = {};
let breadcrumbManagerState = initialBreadcrumbManagerState;

const functionsMocks = {
  buildQuerySummary: jest.fn(() => ({
    state: querySummaryState,
    subscribe: functionsMocks.querySummaryStateSubscriber,
  })),
  buildBreadcrumbManager: jest.fn(() => ({
    state: breadcrumbManagerState,
    subscribe: functionsMocks.breadcrumbManagerStateSubscriber,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  querySummaryStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.querySummaryStateUnsubscriber;
  }),
  breadcrumbManagerStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.breadcrumbManagerStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  querySummaryStateUnsubscriber: jest.fn(),
  breadcrumbManagerStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  retry: jest.fn(),
  getAllFacetsFromStore: jest.fn(() => ({})),
  eventHandler: jest.fn(),
};

const exampleEngine = {
  id: 'example engine',
};
let isInitialized = false;

// @ts-ignore
mockHeadlessLoader.getAllFacetsFromStore = functionsMocks.getAllFacetsFromStore;

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildQuerySummary: functionsMocks.buildQuerySummary,
      buildBreadcrumbManager: functionsMocks.buildBreadcrumbManager,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticRefineToggle && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticRefineToggle) {
      element.setInitializationError();
    }
  };
}

describe('c-quantic-refine-toggle', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    prepareHeadlessState();
  });

  afterEach(() => {
    cleanup();
    querySummaryState = initialQuerySummaryState;
    breadcrumbManagerState = initialBreadcrumbManagerState;
    searchStatusState = initialSearchStatusState;
    isInitialized = false;
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
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the query summary, breadcrumb manager and search status controllers with the proper parameters', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildQuerySummary).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildQuerySummary).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildBreadcrumbManager).toHaveBeenCalledWith(
        exampleEngine
      );
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledWith(
        exampleEngine
      );
    });

    it('should subscribe to the headless query summary, breadcrumb manager and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.querySummaryStateSubscriber).toHaveBeenCalledTimes(
        1
      );
      expect(
        functionsMocks.breadcrumbManagerStateSubscriber
      ).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('the refine toggle', () => {
    describe('when there are no results and no filters selected', () => {
      beforeEach(() => {
        searchStatusState = {...searchStatusState, hasResults: false};
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          hasBreadcrumbs: false,
        };
      });

      it('should disable the refine button', async () => {
        const element = createTestComponent();
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(true);
      });
    });

    describe('when filters are selected despite having no results', () => {
      beforeEach(() => {
        searchStatusState = {...searchStatusState, hasResults: false};
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          facetBreadcrumbs: [{values: [{}]}],
          hasBreadcrumbs: true,
        };
      });

      it('should enable the refine button', async () => {
        const element = createTestComponent();
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(false);
      });
    });

    describe('when results are available even if no filters are selected', () => {
      beforeEach(() => {
        searchStatusState = {...searchStatusState, hasResults: true};
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          hasBreadcrumbs: false,
        };
      });

      it('should enable the refine button', async () => {
        const element = createTestComponent();
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(false);
      });
    });

    describe('when results are available and filters are selected', () => {
      beforeEach(() => {
        searchStatusState = {...searchStatusState, hasResults: true};
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          facetBreadcrumbs: [{values: [{}]}],
          hasBreadcrumbs: true,
        };
      });

      it('should enable the refine button', async () => {
        const element = createTestComponent();
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(false);
      });
    });

    describe('when hideSort is set to false and no facet is rendered', () => {
      it('should enable the refine button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          hideSort: false,
        });
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(false);
      });
    });

    describe('when hideSort is set to true and no facet is rendered', () => {
      it('should disable the refine button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          hideSort: true,
        });
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(true);
      });
    });

    describe('when hideSort is set to true and a facet is rendered', () => {
      it('should enable the refine button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          hideSort: true,
        });
        const renderFacetEvent = new CustomEvent('quantic__renderfacet', {
          detail: {
            id: 'example id',
            shouldRenderFacet: true,
          },
        });
        element.dispatchEvent(renderFacetEvent);

        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        expect(refineToggleButton.disabled).toBe(false);
      });
    });

    describe('when the refine toggle is clicked', () => {
      beforeEach(() => {
        searchStatusState = {...searchStatusState, hasResults: true};
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
        };
      });

      it('should dispatch the quantic__refinemodaltoggle event', async () => {
        document.addEventListener(
          'quantic__refinemodaltoggle',
          // @ts-ignore
          (event) => functionsMocks.eventHandler(event.detail),
          {once: true}
        );

        const element = createTestComponent();
        await flushPromises();

        const refineToggleButton = element.shadowRoot.querySelector(
          selectors.refineToggleButton
        );

        expect(refineToggleButton).not.toBeNull();
        await refineToggleButton.click();

        expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
        expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
          isOpen: true,
        });
      });
    });
  });

  describe('the active filters badge', () => {
    describe('when there is no active filters', () => {
      beforeEach(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          hasBreadcrumbs: false,
        };
      });

      it('should not display the active filters badge', async () => {
        const element = createTestComponent({
          ...defaultOptions,
        });
        await flushPromises();

        const activeFiltersBadge = element.shadowRoot.querySelector(
          selectors.activeFiltersBadge
        );

        expect(activeFiltersBadge).toBeNull();
      });
    });

    describe('when there are active filters', () => {
      const exampleActiveFiltersCount = 3;
      beforeEach(() => {
        breadcrumbManagerState = {
          ...breadcrumbManagerState,
          facetBreadcrumbs: [{values: new Array(exampleActiveFiltersCount)}],
          hasBreadcrumbs: true,
        };
      });

      it('should display the active filters badge', async () => {
        const element = createTestComponent({
          ...defaultOptions,
        });
        await flushPromises();

        const activeFiltersBadge = element.shadowRoot.querySelector(
          selectors.activeFiltersBadge
        );

        expect(activeFiltersBadge).not.toBeNull();
        expect(activeFiltersBadge.textContent).toBe(
          exampleActiveFiltersCount.toString()
        );
      });
    });
  });

  describe('the refine modal', () => {
    describe('when the property fullScreen is set to true', () => {
      it('should set the property fullScreen to true in the modal', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          fullScreen: true,
        });
        await flushPromises();

        const modal = element.shadowRoot.querySelector(selectors.modal);

        expect(modal).not.toBeNull();
        expect(modal.fullScreen).toBe(true);
      });
    });

    describe('when the refine modal close button is clicked', () => {
      it('should dispatch the quantic__refinemodaltoggle event', async () => {
        document.addEventListener(
          'quantic__refinemodaltoggle',
          // @ts-ignore
          (event) => functionsMocks.eventHandler(event.detail),
          {once: true}
        );

        const element = createTestComponent();
        await flushPromises();

        const modalCloseButton = element.shadowRoot.querySelector(
          selectors.modalCloseButton
        );

        expect(modalCloseButton).not.toBeNull();
        await modalCloseButton.click();

        expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
        expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
          isOpen: false,
        });
      });
    });

    describe('when the refine modal view results button is clicked', () => {
      it('should dispatch the quantic__refinemodaltoggle event', async () => {
        document.addEventListener(
          'quantic__refinemodaltoggle',
          // @ts-ignore
          (event) => functionsMocks.eventHandler(event.detail),
          {once: true}
        );

        const element = createTestComponent();
        await flushPromises();

        const modalViewResultsButton = element.shadowRoot.querySelector(
          selectors.modalViewResultsButton
        );

        expect(modalViewResultsButton).not.toBeNull();
        await modalViewResultsButton.click();

        expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
        expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
          isOpen: false,
        });
      });
    });
  });

  describe('the refine modal content', () => {
    describe('when the property hideSort is set to true', () => {
      it('should set the property hideSort to true in the modal content', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          hideSort: true,
        });
        await flushPromises();

        const modalContent = element.shadowRoot.querySelector(
          selectors.modalContent
        );

        expect(modalContent).not.toBeNull();
        expect(modalContent.hideSort).toBe(true);
      });
    });

    describe('when the property disableDynamicNavigation is set to true', () => {
      it('should set the property disableDynamicNavigation to true in the modal content', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          disableDynamicNavigation: true,
        });
        await flushPromises();

        const modalContent = element.shadowRoot.querySelector(
          selectors.modalContent
        );

        expect(modalContent).not.toBeNull();
        expect(modalContent.disableDynamicNavigation).toBe(true);
      });
    });
  });
});
