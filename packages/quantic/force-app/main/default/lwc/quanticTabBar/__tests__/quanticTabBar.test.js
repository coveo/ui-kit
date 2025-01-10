/* eslint-disable no-import-assign */
import QuanticTabBar from '../quanticTabBar';
// @ts-ignore
import {createElement} from 'lwc';

const tabSlotWidth = 100;
const moreButtonWidth = 50;
let mockContainerWidth = 200;
let exampleTabSlots = [];

jest.mock('@salesforce/label/c.quantic_More', () => ({default: 'More'}), {
  virtual: true,
});

jest.mock('c/quanticUtils', () => ({
  getAbsoluteWidth: jest.fn((element) => {
    if (element?.tagName === 'C-QUANTIC-TAB') {
      return tabSlotWidth;
    } else if (element?.dataset?.testid === 'tab-bar_more-section') {
      return moreButtonWidth;
    }
    return mockContainerWidth;
  }),
}));

const defaultOptions = {
  lightTheme: false,
};

const selectors = {
  tabBarContainer: '.tab-bar_container',
  moreTabsSection: '[data-testid="tab-bar_more-section"]',
  moreTabsButton: '[data-testid="tab-bar_more-button"]',
  tabsDropdown: '.slds-dropdown-trigger',
  tabItemsInDropdown: '.slds-dropdown__list li button',
};

const functionMocks = {
  select: jest.fn(),
};

function createExampleTabSlots(numberOfSlots) {
  const tabSlots = [];

  for (let i = 0; i < numberOfSlots; i++) {
    const exampleSlot = document.createElement('c-quantic-tab');
    const value = `tab ${i + 1}`;
    // @ts-ignore
    exampleSlot.getBoundingClientRect = () => ({right: (i + 1) * tabSlotWidth});
    // @ts-ignore
    exampleSlot.label = value;
    // @ts-ignore
    exampleSlot.expression = value;
    // @ts-ignoreF
    exampleSlot.select = () => {
      functionMocks.select(i);
    };

    exampleSlot.dataset.role = 'tab';
    exampleSlot.dataset.value = value;
    exampleSlot.dataset.label = value;

    tabSlots.push(exampleSlot);
  }

  return tabSlots;
}

/**
 * Mocks the return value of the assignedNodes method.
 * @param {Array<Element>} assignedElements
 */
function mockSlotAssignedElements(assignedElements) {
  HTMLSlotElement.prototype.assignedElements = function () {
    return assignedElements;
  };
}

function createTestComponent(options = defaultOptions, assignedElements = []) {
  mockSlotAssignedElements(assignedElements);

  const element = createElement('c-quantic-tab-bar', {
    is: QuanticTabBar,
  });
  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);

  // mocking the positioning of the tab bar container.
  const tabBarContainer = element.shadowRoot.querySelector(
    selectors.tabBarContainer
  );
  tabBarContainer.getBoundingClientRect = () => ({right: mockContainerWidth});

  window.dispatchEvent(new CustomEvent('resize'));
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
}

describe('c-quantic-tab-bar', () => {
  afterEach(() => {
    cleanup();
  });

  describe("when the total tabs width is lower than the container's width", () => {
    beforeEach(() => {
      const numberOfTabs = 2;
      exampleTabSlots = createExampleTabSlots(numberOfTabs);
    });

    it('should display the tabs without displaying the more tabs section', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      expect(moreTabsSection).not.toBeNull();
      const moreTabsSectionIsHidden = moreTabsSection.style.display === 'none';
      expect(moreTabsSectionIsHidden).toBe(true);

      const expectedNumberOfTabsToBeVisible = 2;
      for (let i = 0; i < expectedNumberOfTabsToBeVisible - 1; i++) {
        const tabIsVisible = exampleTabSlots[i].style.visibility === 'visible';
        expect(tabIsVisible).toBe(true);
      }
    });

    describe('reactivity to window resize', () => {
      afterAll(() => {
        mockContainerWidth = 200;
      });

      it('should display the more tab section when the window is resized to a smaller width', async () => {
        const element = createTestComponent(defaultOptions, exampleTabSlots);
        await flushPromises();

        const moreTabsSection = element.shadowRoot.querySelector(
          selectors.moreTabsSection
        );
        expect(moreTabsSection).not.toBeNull();
        const moreTabsSectionIsHidden =
          moreTabsSection.style.display === 'none';
        expect(moreTabsSectionIsHidden).toBe(true);

        mockContainerWidth = 100;
        // mocking the positioning of the tab bar container.
        const tabBarContainer = element.shadowRoot.querySelector(
          selectors.tabBarContainer
        );
        tabBarContainer.getBoundingClientRect = () => ({
          right: mockContainerWidth,
        });
        window.dispatchEvent(new CustomEvent('resize'));
        await flushPromises();

        const moreTabsSectionIsVisible =
          moreTabsSection.style.display === 'block';
        expect(moreTabsSectionIsVisible).toBe(true);
      });

      it('should hide the more tab section when the window is resized to a bigger width', async () => {
        const element = createTestComponent(defaultOptions, exampleTabSlots);
        await flushPromises();

        const moreTabsSection = element.shadowRoot.querySelector(
          selectors.moreTabsSection
        );
        expect(moreTabsSection).not.toBeNull();
        const moreTabsSectionIsVisible =
          moreTabsSection.style.display === 'block';
        expect(moreTabsSectionIsVisible).toBe(true);

        mockContainerWidth = 300;
        // mocking the positioning of the tab bar container.
        const tabBarContainer = element.shadowRoot.querySelector(
          selectors.tabBarContainer
        );
        tabBarContainer.getBoundingClientRect = () => ({
          right: mockContainerWidth,
        });
        window.dispatchEvent(new CustomEvent('resize'));
        await flushPromises();

        const moreTabsSectionIsHidden =
          moreTabsSection.style.display === 'none';
        expect(moreTabsSectionIsHidden).toBe(true);
      });
    });
  });

  describe("when the total tabs width is higher than the container's width", () => {
    beforeEach(() => {
      const numberOfTabs = 3;
      exampleTabSlots = createExampleTabSlots(numberOfTabs);
    });

    it('should only display a sub set of tabs and display the more tabs button', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      expect(moreTabsSection).not.toBeNull();
      const moreTabsSectionIsVisible =
        moreTabsSection.style.display === 'block';
      expect(moreTabsSectionIsVisible).toBe(true);

      const expectedNumberOfTabsToBeVisible = 1;
      const visibleTabs = exampleTabSlots.filter(
        (tab) => tab.style.visibility === 'visible'
      );
      expect(visibleTabs.length).toBe(expectedNumberOfTabsToBeVisible);

      const expectedNumberOfTabsToBeHidden = 2;
      const hiddenTabs = exampleTabSlots.filter(
        (tab) => tab.style.visibility === 'hidden'
      );
      expect(hiddenTabs.length).toBe(expectedNumberOfTabsToBeHidden);
    });

    it('should display the correct tabs in the tabs dropdown list', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const tabItemsInDropdown = element.shadowRoot.querySelectorAll(
        selectors.tabItemsInDropdown
      );

      const expectedNumberOfTabsToBeVisible = 1;
      const expectedNumberOfTabsToBeHidden = 2;

      expect(tabItemsInDropdown.length).toBe(expectedNumberOfTabsToBeHidden);
      const tabsInDropdownLabels = Array.from(tabItemsInDropdown).map(
        (tab) => tab.textContent
      );
      const expectedTabsInDropdownLabels = exampleTabSlots
        .slice(expectedNumberOfTabsToBeVisible)
        .map((tab) => tab.label);
      expect(tabsInDropdownLabels).toEqual(expectedTabsInDropdownLabels);
    });

    it('should open and close the tabs dropdown list after clicking the more tabs button', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const moreTabsButton = element.shadowRoot.querySelector(
        selectors.moreTabsButton
      );
      const tabsDropdown = element.shadowRoot.querySelector(
        selectors.tabsDropdown
      );
      const expectedOpentabsDropdownCSSClass = 'slds-is-open';

      expect(moreTabsButton).not.toBeNull();
      expect(tabsDropdown).not.toBeNull();
      expect(tabsDropdown.classList).not.toContain(
        expectedOpentabsDropdownCSSClass
      );

      await moreTabsButton.click();
      expect(tabsDropdown.classList).toContain(
        expectedOpentabsDropdownCSSClass
      );

      await moreTabsButton.click();
      expect(tabsDropdown.classList).not.toContain(
        expectedOpentabsDropdownCSSClass
      );
    });

    it('should call the select method of a tab when selecting it from the tabs dropdown list', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const expectedNumberOfTabsToBeVisible = 1;
      const expectedNumberOfTabsToBeHidden = 2;

      const tabItemsInDropdown = element.shadowRoot.querySelectorAll(
        selectors.tabItemsInDropdown
      );

      const exampleIndex = 0;
      await tabItemsInDropdown[exampleIndex].click();
      expect(tabItemsInDropdown.length).toBe(expectedNumberOfTabsToBeHidden);
      expect(functionMocks.select).toHaveBeenCalledTimes(1);
      expect(functionMocks.select).toHaveBeenCalledWith(
        expectedNumberOfTabsToBeVisible + exampleIndex
      );
    });
  });

  describe('the lightTheme property', () => {
    it('should display the component with the light theme styles when lightTheme is true', async () => {
      const expectedDarkThemeClass = 'slds-theme_shade';
      const element = createTestComponent({lightTheme: true});
      await flushPromises();

      const tabBarContainer = element.shadowRoot.querySelector(
        selectors.tabBarContainer
      );
      expect(tabBarContainer.classList).not.toContain(expectedDarkThemeClass);
    });

    it('should display the component with the dark theme styles when lightTheme is false', async () => {
      const expectedDarkThemeClass = 'slds-theme_shade';
      const element = createTestComponent({lightTheme: false});
      await flushPromises();

      const tabBarContainer = element.shadowRoot.querySelector(
        selectors.tabBarContainer
      );
      expect(tabBarContainer.classList).toContain(expectedDarkThemeClass);
    });
  });
});
