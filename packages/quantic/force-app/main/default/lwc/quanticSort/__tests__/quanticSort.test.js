/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticSort from 'c/quanticSort';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

const selectors = {
  lightningCombobox: 'lightning-combobox',
  componentError: 'c-quantic-component-error',
  sortDropdown: '[data-testid="sort-dropdown"]',
  initializationError: 'c-quantic-component-error',
};

const sortVariants = {
  default: {
    name: 'default',
    labelContainerSelector: '.sort__header',
    labelSelector: 'lightning-formatted-text',
    dropdownContainerSelector: '.sort__container',
  },
  wide: {
    name: 'wide',
    labelContainerSelector: '.sort__container',
    labelSelector: '[data-testid="filters-title"]',
    dropdownContainerSelector: 'lightning-layout-item',
  },
};

const sortByLabel = 'Sort By';

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_SortBy',
  () => ({default: sortByLabel}),
  {
    virtual: true,
  }
);

function mockBueno(shouldError = false) {
  // @ts-ignore
  mockHeadlessLoader.getBueno = () => {
    // @ts-ignore
    global.Bueno = {
      isString: jest
        .fn()
        .mockImplementation(
          (value) => Object.prototype.toString.call(value) === '[object String]'
        ),
      StringValue: jest.fn(),
      RecordValue: jest.fn(),
      Schema: jest.fn(() => ({
        validate: () => {
          if (shouldError) {
            throw new Error();
          }
          jest.fn();
        },
      })),
    };
    return new Promise((resolve) => resolve());
  };
}

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultSearchStatusState = {
  hasResults: true,
};
let searchStatusState = defaultSearchStatusState;

const functionsMocks = {
  buildSort: jest.fn(() => ({
    state: {},
    subscribe: functionsMocks.sortStateSubscriber,
    sortBy: functionsMocks.sortBy,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.searchStatusStateSubscriber,
  })),
  buildCriterionExpression: jest.fn((criterion) => criterion),
  buildRelevanceSortCriterion: jest.fn(() => 'relevance'),
  buildDateSortCriterion: jest.fn(() => 'date'),
  sortStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.sortStateUnsubscriber;
  }),
  searchStatusStateSubscriber: jest.fn((cb) => {
    cb();
    return functionsMocks.searchStatusStateUnsubscriber;
  }),
  sortStateUnsubscriber: jest.fn(),
  searchStatusStateUnsubscriber: jest.fn(),
  sortBy: jest.fn(),
};

const defaultOptions = {
  engineId: exampleEngine.id,
  variant: 'default',
};

/**
 * Mocks the return value of the assignedNodes method.
 * @param {Array<Element>} assignedElements
 */
function mockSlotAssignedNodes(assignedElements) {
  HTMLSlotElement.prototype.assignedNodes = function () {
    return assignedElements;
  };
}

function createTestComponent(options = defaultOptions, assignedElements = []) {
  prepareHeadlessState();
  mockSlotAssignedNodes(assignedElements);

  const element = createElement('c-quantic-sort', {
    is: QuanticSort,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }
  document.body.appendChild(element);
  return element;
}

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildSort: functionsMocks.buildSort,
      buildCriterionExpression: functionsMocks.buildCriterionExpression,
      buildSearchStatus: functionsMocks.buildSearchStatus,
      buildRelevanceSortCriterion: functionsMocks.buildRelevanceSortCriterion,
      buildDateSortCriterion: functionsMocks.buildDateSortCriterion,
      SortOrder: {
        Descending: 'descending',
        Ascending: 'ascending',
      },
    };
  };
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticSort && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticSort) {
      element.setInitializationError();
    }
  };
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
  isInitialized = false;
}

describe('c-quantic-sort', () => {
  beforeEach(() => {
    mockSuccessfulHeadlessInitialization();
    mockBueno();
  });

  afterEach(() => {
    cleanup();
    searchStatusState = defaultSearchStatusState;
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
    it('should subscribe to the headless sort and search status state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.sortStateSubscriber).toHaveBeenCalledTimes(1);
      expect(functionsMocks.searchStatusStateSubscriber).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('when no results are found', () => {
    beforeAll(() => {
      searchStatusState = {...defaultSearchStatusState, hasResults: false};
    });

    it('should not display the sort dropdown', async () => {
      const element = createTestComponent();
      await flushPromises();

      const sortDropdown = element.shadowRoot.querySelector(
        selectors.sortDropdown
      );

      expect(sortDropdown).toBeNull();
    });
  });

  describe('when a sort option is selected', () => {
    it('should call the sortBy method of the sort controller', async () => {
      const element = createTestComponent();
      await flushPromises();

      const lightningCombobox = element.shadowRoot.querySelector(
        selectors.lightningCombobox
      );
      const exampleDefaultSortOptionValue = 'relevance';
      expect(lightningCombobox).not.toBeNull();

      lightningCombobox.dispatchEvent(
        new CustomEvent('change', {
          detail: {value: exampleDefaultSortOptionValue},
        })
      );

      expect(functionsMocks.sortBy).toHaveBeenCalledTimes(1);
      expect(functionsMocks.sortBy).toHaveBeenCalledWith(
        exampleDefaultSortOptionValue
      );
    });
  });

  describe('when custom sort options are passed', () => {
    const exampleSlot = {
      value: 'example value',
      label: 'example label',
      criterion: {
        by: 'example field',
        order: 'example order',
      },
    };
    const exampleAssignedElements = [exampleSlot];

    it('should build the controller with the correct sort option and display the custom sort options', async () => {
      const element = createTestComponent(
        defaultOptions,
        exampleAssignedElements
      );
      await flushPromises();

      expect(functionsMocks.buildSort).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSort).toHaveBeenCalledWith(exampleEngine, {
        initialState: {
          criterion: {
            by: 'example field',
            order: 'example order',
          },
        },
      });
      const lightningCombobox = element.shadowRoot.querySelector(
        selectors.lightningCombobox
      );

      expect(lightningCombobox.options).toEqual([exampleSlot]);
    });
  });

  describe('when invalid sort options are passed', () => {
    beforeEach(() => {
      mockBueno(true);
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    const invalidExampleSlot = {
      value: 'example value',
      label: '',
      criterion: {
        by: 'example field',
        order: 'example order',
      },
    };
    const exampleAssignedElements = [invalidExampleSlot];

    it('should display the component error', async () => {
      const element = createTestComponent(
        defaultOptions,
        exampleAssignedElements
      );
      await flushPromises();

      expect(functionsMocks.buildSort).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSort).toHaveBeenCalledWith(exampleEngine, {
        initialState: {
          criterion: {
            by: 'example field',
            order: 'example order',
          },
        },
      });
      const componentError = element.shadowRoot.querySelector(
        selectors.componentError
      );

      expect(componentError).not.toBeNull();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('when passing the "default" variant', () => {
    const variant = sortVariants.default;

    it('should render the component with the default width', async () => {
      const element = createTestComponent();
      await flushPromises();

      const defaultLabelContainer = element.shadowRoot.querySelector(
        variant.labelContainerSelector
      );
      const defaultVariantDropdownContainer = element.shadowRoot.querySelector(
        variant.dropdownContainerSelector
      );

      expect(defaultLabelContainer.classList).toContain(
        'slds-var-p-right_small'
      );
      expect(defaultVariantDropdownContainer.classList).not.toContain(
        'slds-size_1-of-1'
      );
    });

    it('should properly render the label', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        variant: variant.name,
      });
      await flushPromises();

      const sortLabel = element.shadowRoot.querySelector(variant.labelSelector);

      expect(sortLabel.value).toBe(sortByLabel);
    });
  });

  describe('when passing the "wide" variant', () => {
    const variant = sortVariants.wide;

    it('should render the component with the wide width', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        variant: variant.name,
      });
      await flushPromises();

      const wideVariantLabelContainer = element.shadowRoot.querySelector(
        variant.labelContainerSelector
      );
      const wideVariantDropdownContainer = element.shadowRoot.querySelector(
        variant.dropdownContainerSelector
      );

      expect(wideVariantLabelContainer.classList).toContain(
        'sort__container--wide'
      );
      expect(wideVariantDropdownContainer.classList).toContain(
        'slds-size_1-of-1'
      );
      expect(wideVariantDropdownContainer.classList).not.toContain(
        'slds-var-p-right_small'
      );
    });

    it('should properly render the label', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        variant: variant.name,
      });
      await flushPromises();

      const sortLabel = element.shadowRoot.querySelector(variant.labelSelector);

      expect(sortLabel.textContent).toBe(sortByLabel);
      expect(sortLabel.classList).toContain('slds-text-heading_small');
    });
  });
});
