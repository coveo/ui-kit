/* eslint-disable jest/no-conditional-expect */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticCarousel from '../quanticCarousel';

const exampleNumberOfPages = 2;
const exampleNumberOfItemsPerPage = 1;
const selectors = {
  previousNavigation: '.carousel__previous-navigation',
  nextNavigation: '.carousel__next-navigation',
  indicators: '.carousel__indicator',
  error: 'c-quantic-component-error',
  carousel: 'section[role="region"]',
};

const exampleItemOne = document.createElement('div');
exampleItemOne.innerText = 'Item One';
const exampleItemTwo = document.createElement('div');
exampleItemTwo.innerText = 'Item Two';
const activeCarouselIndicatorCSSClass = 'carousel__indicator--active';
const carouselItemDisplayedStyles = '';
const carouselItemHiddenStyles = 'none';
const exampleAssignedElements = [exampleItemOne, exampleItemTwo];
const exampleLabel = 'example Label';

const defaultOptions = {
  itemsPerPage: exampleNumberOfItemsPerPage,
  label: exampleLabel,
};

function createTestComponent(
  options = defaultOptions,
  assignedElements = exampleAssignedElements
) {
  mockSlotAssignedNodes(assignedElements);

  const element = createElement('c-quantic-carousel', {
    is: QuanticCarousel,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Mocks the return value of the assignedNodes method.
 * @param {Array<Element>} assignedElements
 */
function mockSlotAssignedNodes(assignedElements) {
  HTMLSlotElement.prototype.assignedNodes = function () {
    return assignedElements;
  };
}

const invalidPositiveIntegerProperty =
  'The value of the property must be an integer greater than 0.';
jest.mock(
  '@salesforce/label/c.quantic_InvalidPositiveIntegerProperty',
  () => ({default: invalidPositiveIntegerProperty}),
  {
    virtual: true,
  }
);

describe('c-quantic-carousel', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  it('should properly handle the different pages of the carousel when changing pages', async () => {
    const element = createTestComponent();
    await flushPromises();

    const previousNavigation = element.shadowRoot.querySelector(
      selectors.previousNavigation
    );
    const nextNavigation = element.shadowRoot.querySelector(
      selectors.nextNavigation
    );
    expect(exampleItemOne.style.display).toBe(carouselItemDisplayedStyles);
    expect(exampleItemTwo.style.display).toBe(carouselItemHiddenStyles);

    nextNavigation.click();
    await flushPromises();
    expect(exampleItemOne.style.display).toBe(carouselItemHiddenStyles);
    expect(exampleItemTwo.style.display).toBe(carouselItemDisplayedStyles);

    previousNavigation.click();
    await flushPromises();
    expect(exampleItemOne.style.display).toBe(carouselItemDisplayedStyles);
    expect(exampleItemTwo.style.display).toBe(carouselItemHiddenStyles);
  });

  it('should display the correct number of carousel indicators in the correct state', async () => {
    const element = createTestComponent();
    await flushPromises();

    const carouselIndicators = element.shadowRoot.querySelectorAll(
      selectors.indicators
    );

    expect(carouselIndicators.length).toBe(exampleNumberOfPages);
    carouselIndicators.forEach((indicator, index) => {
      if (index === 0) {
        expect(indicator.classList).toContain(activeCarouselIndicatorCSSClass);
      } else {
        expect(indicator.classList).not.toContain(
          activeCarouselIndicatorCSSClass
        );
      }
    });
  });

  it('should use the correct carousel label', async () => {
    const element = createTestComponent();
    await flushPromises();

    const carousel = element.shadowRoot.querySelector(selectors.carousel);

    expect(carousel).not.toBeNull();
    expect(carousel.ariaLabel).toBe(exampleLabel);
  });

  describe('when interacting with the carousel indicators', () => {
    it('should correctly mark as active the carousel indicator that was clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      const carouselIndicators = element.shadowRoot.querySelectorAll(
        selectors.indicators
      );

      expect(carouselIndicators.length).toBe(exampleNumberOfPages);

      carouselIndicators[exampleNumberOfPages - 1].click();
      await flushPromises();

      carouselIndicators.forEach((indicator, index) => {
        if (index === exampleNumberOfPages - 1) {
          expect(indicator.classList).toContain(
            activeCarouselIndicatorCSSClass
          );
        } else {
          expect(indicator.classList).not.toContain(
            activeCarouselIndicatorCSSClass
          );
        }
      });
    });
  });

  describe('when being in the first page of the carousel', () => {
    it('the previous navigation button should be disabled and the next navigation button should be enabled', async () => {
      const element = createTestComponent();
      await flushPromises();
      const previousNavigation = element.shadowRoot.querySelector(
        selectors.previousNavigation
      );
      const nextNavigation = element.shadowRoot.querySelector(
        selectors.nextNavigation
      );

      expect(previousNavigation).not.toBeNull();
      expect(previousNavigation.disabled).toBe(true);
      expect(nextNavigation).not.toBeNull();
      expect(nextNavigation.disabled).toBe(false);
    });
  });

  describe('when being in the last page of the carousel', () => {
    it('the previous navigation button should be enabled and the next navigation button should be disabled', async () => {
      const element = createTestComponent();
      element.currentPage = exampleNumberOfPages - 1;
      await flushPromises();

      const previousNavigation = element.shadowRoot.querySelector(
        selectors.previousNavigation
      );
      const nextNavigation = element.shadowRoot.querySelector(
        selectors.nextNavigation
      );

      expect(previousNavigation).not.toBeNull();
      expect(previousNavigation.disabled).toBe(false);
      expect(nextNavigation).not.toBeNull();
      expect(nextNavigation.disabled).toBe(true);
    });
  });

  describe('when used with invalid properties', () => {
    let consoleError;

    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleError.mockReset();
    });

    it('should display an error message when the property itemsPerPage is undefined', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        itemsPerPage: undefined,
      });

      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.message).toBe(invalidPositiveIntegerProperty);
      expect(consoleError).toHaveBeenCalledWith(invalidPositiveIntegerProperty);
    });

    it('should display an error message when the property itemsPerPage is not a valid number', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        // @ts-ignore
        itemsPerPage: 'invalid value',
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.message).toBe(invalidPositiveIntegerProperty);
      expect(consoleError).toHaveBeenCalledWith(invalidPositiveIntegerProperty);
    });

    it('should display an error message when the property itemsPerPage is a negative value', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        itemsPerPage: -1,
      });
      await flushPromises();

      const error = element.shadowRoot.querySelector(selectors.error);

      expect(error).not.toBeNull();
      expect(error.message).toBe(invalidPositiveIntegerProperty);
      expect(consoleError).toHaveBeenCalledWith(invalidPositiveIntegerProperty);
    });
  });
});
