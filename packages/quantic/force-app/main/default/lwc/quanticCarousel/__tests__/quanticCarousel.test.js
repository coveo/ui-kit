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
};

const exampleItemOne = document.createElement('div');
exampleItemOne.innerText = 'Item One';
const exampleItemTwo = document.createElement('div');
exampleItemTwo.innerText = 'Item Two';
const activeCarouselIndicatorCSSClass = 'carousel__indicator--active';
const carouselItemDisplayedStyles = '';
const carouselItemHiddenStyles = 'none';
const exampleAssignedElements = [exampleItemOne, exampleItemTwo];

const defaultOptions = {
  numberOfPages: exampleNumberOfPages,
  numberOfItemsPerPage: exampleNumberOfItemsPerPage,
};

function createTestComponent(options = defaultOptions, assignedElements = exampleAssignedElements) {
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

describe('c-quantic-carousel', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  afterEach(() => {
    cleanup();
  });

  it('should properly display the diffrent pages of the carousel', async () => {
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

  describe('when interacting with the carousel indicators', () => {
    it('should display the correct number carousel indicators in the correct state', async () => {
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
    it('should disable the previous navigation button and enable the next navigation button', async () => {
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
    it('should enable the previous navigation button and disable the next navigation button', async () => {
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
});
