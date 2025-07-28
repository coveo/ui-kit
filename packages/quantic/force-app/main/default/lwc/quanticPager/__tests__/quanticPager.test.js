/* eslint-disable no-import-assign */
import QuanticPager from '../quanticPager';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticHeadlessLoader');
jest.mock(
  '@salesforce/label/c.quantic_GoToPage',
  () => ({default: 'Go to page {{0}}'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_NextPage',
  () => ({default: 'Next page'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_PreviousPage',
  () => ({default: 'Previous page'}),
  {
    virtual: true,
  }
);

let isInitialized = false;

const exampleEngine = {
  id: 'exampleEngineId',
};

const defaultOptions = {
  engineId: exampleEngine.id,
  numberOfPages: 5,
};

const selectors = {
  previousButton: '[data-testid="previous-button"]',
  nextButton: '[data-testid="next-button"]',
  pageButton: 'c-quantic-number-button',
  pagerContainer: 'lightning-button-group',
  componentError: 'c-quantic-component-error',
};

const initialPagerState = {
  hasPreviousPage: false,
  hasNextPage: true,
  currentPages: [1, 2, 3, 4, 5],
  currentPage: 1,
};
let pagerState = initialPagerState;

const initialSearchStatusState = {
  hasResults: true,
};
let searchStatusState = initialSearchStatusState;

const functionsMocks = {
  previousPage: jest.fn(() => {}),
  nextPage: jest.fn(() => {}),
  selectPage: jest.fn(() => {}),
  buildPager: jest.fn(() => ({
    previousPage: functionsMocks.previousPage,
    nextPage: functionsMocks.nextPage,
    selectPage: functionsMocks.selectPage,
    state: pagerState,
    subscribe: functionsMocks.subscribePager,
  })),
  buildSearchStatus: jest.fn(() => ({
    state: searchStatusState,
    subscribe: functionsMocks.subscribeSearchStatus,
  })),
  subscribePager: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribePager;
  }),
  unsubscribePager: jest.fn(() => {}),
  subscribeSearchStatus: jest.fn((cb) => {
    cb();
    return functionsMocks.unsubscribeSearchStatus;
  }),
  unsubscribeSearchStatus: jest.fn(() => {}),
};

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => {
    return {
      buildPager: functionsMocks.buildPager,
      buildSearchStatus: functionsMocks.buildSearchStatus,
    };
  };
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticPager && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

function mockErroneousHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element) => {
    if (element instanceof QuanticPager) {
      element.setInitializationError();
    }
  };
}

const createTestComponent = buildCreateTestComponent(
  QuanticPager,
  'c-quantic-pager',
  defaultOptions
);

describe('c-quantic-pager', () => {
  afterEach(() => {
    cleanup();
    isInitialized = false;
    pagerState = {...initialPagerState};
    searchStatusState = {...initialSearchStatusState};
  });

  describe('controller initialization', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should build the necessary controllers and subscribe to the headless state changes', async () => {
      createTestComponent();
      await flushPromises();

      expect(functionsMocks.buildPager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildPager).toHaveBeenCalledWith(exampleEngine, {
        options: {
          numberOfPages: defaultOptions.numberOfPages,
        },
      });
      expect(functionsMocks.subscribePager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.buildSearchStatus).toHaveBeenCalledTimes(1);
      expect(functionsMocks.subscribeSearchStatus).toHaveBeenCalledTimes(1);
    });

    describe('#numberOfPages property', () => {
      it('should initialize the controller with the provided numberOfPages', async () => {
        const customNumberOfPages = 10;
        createTestComponent({
          numberOfPages: customNumberOfPages,
        });
        await flushPromises();

        expect(functionsMocks.buildPager).toHaveBeenCalledTimes(1);
        expect(functionsMocks.buildPager).toHaveBeenCalledWith(exampleEngine, {
          options: {
            numberOfPages: customNumberOfPages,
          },
        });
      });
    });
  });

  describe('when hasResults is true', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
      searchStatusState.hasResults = true;
    });

    it('should render the pager when there are results', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.pagerContainer)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.previousButton)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.nextButton)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelectorAll(selectors.pageButton).length
      ).toBe(initialPagerState.currentPages.length);
    });

    describe('previous button', () => {
      it('should be disabled when hasPreviousPage is false', async () => {
        pagerState.hasPreviousPage = false;
        const element = createTestComponent();
        await flushPromises();

        const previousButton = element.shadowRoot.querySelector(
          selectors.previousButton
        );
        expect(previousButton).not.toBeNull();
        expect(previousButton.disabled).toBe(true);
      });

      it('should be enabled when hasPreviousPage is true', async () => {
        pagerState.hasPreviousPage = true;
        const element = createTestComponent();
        await flushPromises();

        const previousButton = element.shadowRoot.querySelector(
          selectors.previousButton
        );
        expect(previousButton).not.toBeNull();
        expect(previousButton.disabled).toBe(false);
      });

      it('should call previousPage when clicked', async () => {
        pagerState.hasPreviousPage = true;
        const element = createTestComponent();
        await flushPromises();

        const previousButton = element.shadowRoot.querySelector(
          selectors.previousButton
        );
        expect(previousButton).not.toBeNull();
        previousButton.click();
        expect(functionsMocks.previousPage).toHaveBeenCalledTimes(1);
      });
    });

    describe('next button', () => {
      it('should be disabled when hasNextPage is false', async () => {
        pagerState.hasNextPage = false;
        const element = createTestComponent();
        await flushPromises();

        const nextButton = element.shadowRoot.querySelector(
          selectors.nextButton
        );
        expect(nextButton).not.toBeNull();
        expect(nextButton.disabled).toBe(true);
      });

      it('should be enabled when hasNextPage is true', async () => {
        pagerState.hasNextPage = true;
        const element = createTestComponent();
        await flushPromises();

        const nextButton = element.shadowRoot.querySelector(
          selectors.nextButton
        );
        expect(nextButton).not.toBeNull();
        expect(nextButton.disabled).toBe(false);
      });

      it('should call nextPage when clicked', async () => {
        pagerState.hasNextPage = true;
        const element = createTestComponent();
        await flushPromises();

        const nextButton = element.shadowRoot.querySelector(
          selectors.nextButton
        );
        nextButton.click();
        expect(functionsMocks.nextPage).toHaveBeenCalledTimes(1);
      });
    });

    describe('page buttons', () => {
      it('should generate correct page objects with proper selection state', async () => {
        pagerState.currentPages = [1, 2, 3, 4, 5];
        pagerState.currentPage = 3;
        const element = createTestComponent();
        await flushPromises();

        const pageObjects = Array.from(
          element.shadowRoot.querySelectorAll(selectors.pageButton)
        ).map((button) => ({
          number: button.number,
          selected: button.selected,
          ariaLabelValue: button.ariaLabelValue,
        }));
        expect(pageObjects).toEqual([
          {
            number: 1,
            selected: false,
            ariaLabelValue: 'Go to page 1',
          },
          {
            number: 2,
            selected: false,
            ariaLabelValue: 'Go to page 2',
          },
          {
            number: 3,
            selected: true,
            ariaLabelValue: 'Go to page 3',
          },
          {
            number: 4,
            selected: false,
            ariaLabelValue: 'Go to page 4',
          },
          {
            number: 5,
            selected: false,
            ariaLabelValue: 'Go to page 5',
          },
        ]);
      });

      it('should call selectPage with correct page number when goto is called', async () => {
        const element = createTestComponent();
        await flushPromises();

        const allButtons = Array.from(
          element.shadowRoot.querySelectorAll(selectors.pageButton)
        );
        const thirdPageButton = allButtons[2];
        const quanticSelectEvent = new CustomEvent('quantic__select', {
          detail: 3, // Simulating click on the third page button
        });
        thirdPageButton.dispatchEvent(quanticSelectEvent);
        expect(functionsMocks.selectPage).toHaveBeenCalledTimes(1);
        expect(functionsMocks.selectPage).toHaveBeenCalledWith(3);
      });
    });
  });

  describe('when hasResults is false', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
      searchStatusState.hasResults = false;
    });

    it('should not render', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.pagerContainer)
      ).toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.previousButton)
      ).toBeNull();
      expect(element.shadowRoot.querySelector(selectors.nextButton)).toBeNull();
      expect(
        element.shadowRoot.querySelectorAll(selectors.pageButton).length
      ).toBe(0);
    });
  });

  describe('disconnectedCallback', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should unsubscribe from pager and search status when component is disconnected', async () => {
      const element = createTestComponent();
      await flushPromises();

      element.remove();

      expect(functionsMocks.unsubscribePager).toHaveBeenCalledTimes(1);
      expect(functionsMocks.unsubscribeSearchStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there is an initialization error', () => {
    beforeEach(() => {
      mockErroneousHeadlessInitialization();
      prepareHeadlessState();
    });
    it('should display the error component', async () => {
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.componentError)
      ).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    it('should not cause any error with and empty currentPages array', async () => {
      pagerState.currentPages = [];
      const element = createTestComponent();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.pagerContainer)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.previousButton)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelector(selectors.nextButton)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelectorAll(selectors.pageButton).length
      ).toBe(0);
    });

    it('should handle numberOfPages as string and convert to number', async () => {
      createTestComponent({
        numberOfPages: '7',
      });
      await flushPromises();

      expect(functionsMocks.buildPager).toHaveBeenCalledWith(
        exampleEngine,
        expect.objectContaining({
          options: expect.objectContaining({
            numberOfPages: 7, // should be converted to number
          }),
        })
      );
    });
  });
});
