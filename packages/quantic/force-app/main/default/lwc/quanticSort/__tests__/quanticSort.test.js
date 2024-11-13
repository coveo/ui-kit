/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-import-assign */
import QuanticSort from 'c/quanticSort';
// @ts-ignore
import {createElement} from 'lwc';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

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
    labelSelector: '[data-cy="filters-title"]',
    dropdownContainerSelector: 'lightning-layout-item',
  },
};

jest.mock('c/quanticHeadlessLoader');
jest.mock('@salesforce/label/c.quantic_SortBy', () => ({default: 'Sort By'}), {
  virtual: true,
});

function mockBueno() {
  jest.spyOn(mockHeadlessLoader, 'getBueno').mockReturnValue(
    new Promise(() => {
      // @ts-ignore
      global.Bueno = {
        isString: jest
          .fn()
          .mockImplementation(
            (value) =>
              Object.prototype.toString.call(value) === '[object String]'
          ),
      };
    })
  );
}

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const mockSearchStatusState = {
  hasResults: true,
};

const mockSearchStatus = {
  state: mockSearchStatusState,
  subscribe: jest.fn((callback) => {
    callback();
    return jest.fn();
  }),
};

const functionsMocks = {
  buildSort: jest.fn(() => ({
    state: {},
    subscribe: functionsMocks.subscribe,
  })),
  buildCriterionExpression: jest.fn((criterion) => criterion),
  buildRelevanceSortCriterion: jest.fn(() => 'relevance'),
  buildDateSortCriterion: jest.fn(() => 'date'),
  buildSearchStatus: jest.fn(() => mockSearchStatus),
  subscribe: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribe;
  }),
  unsubscribe: jest.fn(() => {}),
};

const defaultOptions = {
  engineId: exampleEngine.id,
  variant: 'default',
};

const expectedSortByLabel = 'Sort By';

function createTestComponent(options = defaultOptions) {
  prepareHeadlessState();

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
  });

  describe('controller initialization', () => {
    it('should subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.subscribe).toHaveBeenCalledTimes(1);
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

      expect(sortLabel.value).toBe(expectedSortByLabel);
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

      expect(sortLabel.textContent).toBe(expectedSortByLabel);
      expect(sortLabel.classList).toContain('slds-text-heading_small');
    });
  });
});
