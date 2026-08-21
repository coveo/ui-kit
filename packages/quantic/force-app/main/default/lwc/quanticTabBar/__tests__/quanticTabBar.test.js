/* eslint-disable no-import-assign */
import QuanticTabBar from '../quanticTabBar';
import * as quanticUtils from 'c/quanticUtils';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

const tabSlotWidth = 100;
const moreButtonWidth = 50;
let mockContainerWidth = 200;
let exampleTabSlots = [];

jest.mock('@salesforce/label/c.quantic_More', () => ({default: 'More'}), {
  virtual: true,
});

jest.mock('c/quanticUtils', () => ({
  getAbsoluteWidth: jest.fn((element) => {
    if (!element) {
      return 0;
    }
    if (element?.tagName === 'C-QUANTIC-TAB') {
      // @ts-ignore
      return element.mockWidth ?? tabSlotWidth;
    } else if (element?.dataset?.testid === 'tab-bar_more-section') {
      // Mirrors real getBoundingClientRect() behavior: an element with display:none has
      // zero width, even though it still has layout dimensions once visibility is hidden.
      if (element.style?.display === 'none') {
        return 0;
      }
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
    exampleSlot.getBoundingClientRect = () => ({
      right: exampleSlot.mockRight ?? (i + 1) * tabSlotWidth,
      width: exampleSlot.mockWidth ?? tabSlotWidth,
    });
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

  const buildComponent = buildCreateTestComponent(
    QuanticTabBar,
    'c-quantic-tab-bar',
    defaultOptions
  );
  const element = buildComponent(options);

  // mocking the positioning of the tab bar container.
  const tabBarContainer = element.shadowRoot.querySelector(
    selectors.tabBarContainer
  );
  tabBarContainer.getBoundingClientRect = () => ({
    right: mockContainerWidth,
    width: mockContainerWidth,
  });
  const moreTabsSection = element.shadowRoot.querySelector(
    selectors.moreTabsSection
  );
  moreTabsSection.getBoundingClientRect = () => ({
    width: moreTabsSection.style.display === 'none' ? 0 : moreButtonWidth,
  });

  window.dispatchEvent(new CustomEvent('resize'));
  return element;
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
          width: mockContainerWidth,
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
          width: mockContainerWidth,
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

    it('should refresh dropdown labels when a tab label changes', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      // @ts-ignore
      exampleTabSlots[1].label = 'New 2';
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      const tabItemsInDropdown = element.shadowRoot.querySelectorAll(
        selectors.tabItemsInDropdown
      );
      expect(tabItemsInDropdown[0].textContent).toBe('New 2');
    });

    it('should refresh dropdown values when a tab expression changes', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();
      functionMocks.select.mockClear();

      // @ts-ignore
      exampleTabSlots[1].expression = '@newexpression';
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      const tabItemsInDropdown = element.shadowRoot.querySelectorAll(
        selectors.tabItemsInDropdown
      );
      expect(tabItemsInDropdown[0].getAttribute('data-value')).toBe(
        '@newexpression'
      );

      await tabItemsInDropdown[0].click();
      expect(functionMocks.select).toHaveBeenCalledWith(1);
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
    it('should keep the more tabs section visible after selecting an overflowing tab', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      const tabItemsInDropdown = element.shadowRoot.querySelectorAll(
        selectors.tabItemsInDropdown
      );

      // @ts-ignore
      exampleTabSlots[1].select = () => {
        // @ts-ignore
        exampleTabSlots[0].isActive = false;
        // @ts-ignore
        exampleTabSlots[1].isActive = true;
        element.dispatchEvent(
          new CustomEvent('quantic__tabrendered', {bubbles: true})
        );
      };

      await tabItemsInDropdown[0].click();
      await flushPromises();

      expect(moreTabsSection.style.display).toBe('block');
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

  describe('performance: reduced recomputation on repeated re-renders', () => {
    beforeEach(() => {
      const numberOfTabs = 3;
      exampleTabSlots = createExampleTabSlots(numberOfTabs);
    });

    it('should not recompute the layout when quantic__tabrendered is dispatched repeatedly with no underlying change', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      const initialMoreButtonLeft = moreTabsSection.style.left;
      const initialVisibleTabs = exampleTabSlots
        .filter((tab) => tab.style.visibility === 'visible')
        .map((tab) => tab.label);

      quanticUtils.getAbsoluteWidth.mockClear();

      // Simulate several QuanticTab children dispatching quantic__tabrendered with no
      // layout-relevant change (e.g. repeated no-op state updates), as would happen with
      // the dispatch-gating fix in place on QuanticTab, and even without it (defense in depth).
      const numberOfDispatches = 5;
      for (let i = 0; i < numberOfDispatches; i++) {
        element.dispatchEvent(
          new CustomEvent('quantic__tabrendered', {bubbles: true})
        );
        // eslint-disable-next-line no-await-in-loop
        await flushPromises();
      }

      // The skip-guard still needs to read the container width and each tab's rendered width
      // once per dispatch to compute the fingerprint and decide whether to skip (the tab
      // width is included so that a tab's content changing width, without the tab count,
      // container width, or active tab changing, is still correctly detected as
      // layout-relevant). It should not perform the full layout pass beyond that, which
      // would call getAbsoluteWidth many more times per dispatch (once per tab for
      // slotContentWidth again, plus the more button and selected tab). One call per tab
      // plus one for the container (tabCount + 1) is the expected minimal cost per dispatch;
      // anything close to double that would indicate the skip-guard failed to skip.
      const callsPerDispatch =
        quanticUtils.getAbsoluteWidth.mock.calls.length / numberOfDispatches;
      expect(callsPerDispatch).toBeLessThanOrEqual(exampleTabSlots.length + 1);

      // Rendered output must remain correct despite the skipped recomputation.
      const finalVisibleTabs = exampleTabSlots
        .filter((tab) => tab.style.visibility === 'visible')
        .map((tab) => tab.label);
      expect(finalVisibleTabs).toEqual(initialVisibleTabs);
      expect(moreTabsSection.style.left).toBe(initialMoreButtonLeft);
    });

    it('should recompute the layout when the active tab changes between quantic__tabrendered dispatches', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      // @ts-ignore
      exampleTabSlots[1].isActive = true;
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      const visibleTabs = exampleTabSlots.filter(
        (tab) => tab.style.visibility === 'visible'
      );
      expect(visibleTabs).toEqual([exampleTabSlots[1]]);
    });

    it('should recompute when tab positions change after selecting an overflowing tab', async () => {
      const tabs = createExampleTabSlots(4);
      tabs.forEach((tab, index) => {
        // @ts-ignore
        tab.mockWidth = 60;
        // @ts-ignore
        tab.mockRight = (index + 1) * 60 + 20;
      });
      // @ts-ignore
      tabs[0].isActive = true;
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      // The first render event sees the old positions while the newly selected tab is active.
      // @ts-ignore
      tabs[0].isActive = false;
      // @ts-ignore
      tabs[3].isActive = true;
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      // Flex ordering changes the tab positions after the first layout pass.
      // @ts-ignore
      tabs[0].mockRight = 100;
      // @ts-ignore
      tabs[1].mockRight = 220;
      // @ts-ignore
      tabs[2].mockRight = 280;
      // @ts-ignore
      tabs[3].mockRight = 160;
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      const visibleTabsAfterReorder = tabs.filter(
        (tab) => tab.style.visibility === 'visible'
      );
      expect(visibleTabsAfterReorder).toEqual([tabs[0], tabs[3]]);
      expect(
        element.shadowRoot.querySelector(selectors.moreTabsSection).style
          .display
      ).toBe('block');
    });

    it('should reduce total layout-read work across a sequence of no-op dispatches compared to always doing a full pass', async () => {
      const element = createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

      quanticUtils.getAbsoluteWidth.mockClear();

      const numberOfDispatches = 10;
      for (let i = 0; i < numberOfDispatches; i++) {
        element.dispatchEvent(
          new CustomEvent('quantic__tabrendered', {bubbles: true})
        );
        // eslint-disable-next-line no-await-in-loop
        await flushPromises();
      }

      // A full (unguarded) layout pass reads getAbsoluteWidth for each tab plus the more
      // button and selected tab, so it is always more than the tab count. With the
      // skip-guard, ten no-op dispatches should cost far less than ten full passes worth
      // of calls (i.e. less than numberOfDispatches * (tabCount + 2)).
      const unguardedUpperBound =
        numberOfDispatches * (exampleTabSlots.length + 2);
      expect(quanticUtils.getAbsoluteWidth.mock.calls.length).toBeLessThan(
        unguardedUpperBound
      );
    });

    it('should recompute the layout when a tab changes width without the tab count, container width, or active tab changing', async () => {
      const numberOfTabs = 2;
      const tabs = createExampleTabSlots(numberOfTabs);
      // Start with tabs narrow enough to fit comfortably within the 200px mocked container.
      tabs.forEach((tab) => {
        // @ts-ignore
        tab.mockWidth = 50;
      });
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      expect(moreTabsSection.style.display).toBe('none');

      // Simulate one tab's rendered content changing width (e.g. a placeholder label being
      // replaced by a much longer real label) without changing the tab count, container
      // width, or which tab is active — this must still be detected as layout-relevant.
      // @ts-ignore
      tabs[0].mockWidth = 400;
      element.dispatchEvent(
        new CustomEvent('quantic__tabrendered', {bubbles: true})
      );
      await flushPromises();

      expect(moreTabsSection.style.display).toBe('block');
    });
  });

  describe('more button visibility', () => {
    it('should correctly split tabs into displayed/overflowing on the very first pass, when the more button starts display:none', async () => {
      // Reproduces a bug where measuring moreButtonWidth before setting visibility caused it
      // to read as 0, under-reserving space and marking one extra tab as fitting.
      const numberOfTabs = 3;
      exampleTabSlots = createExampleTabSlots(numberOfTabs);
      createTestComponent(defaultOptions, exampleTabSlots);
      await flushPromises();

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

    it('should correctly position the more button when only the active tab is displayed from the very first render', async () => {
      mockContainerWidth = 90;
      const numberOfTabs = 4;
      const tabs = createExampleTabSlots(numberOfTabs);
      // @ts-ignore
      tabs[0].isActive = true;
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      const moreTabsSectionIsVisible =
        moreTabsSection.style.display === 'block';
      expect(moreTabsSectionIsVisible).toBe(true);

      const visibleTabs = tabs.filter(
        (tab) => tab.style.visibility === 'visible'
      );
      expect(visibleTabs.length).toBe(1);
      expect(visibleTabs[0]).toBe(tabs[0]);

      const expectedLeft = tabs[0].getBoundingClientRect().right;
      expect(moreTabsSection.style.left).toBe(`${expectedLeft}px`);
      expect(moreTabsSection.style.left).not.toBe('0px');

      mockContainerWidth = 200;
    });

    it('should show the More label on the more button once it is visible', async () => {
      const numberOfTabs = 3;
      const tabs = createExampleTabSlots(numberOfTabs);
      // @ts-ignore
      tabs[0].isActive = true;
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      const moreTabsButton = element.shadowRoot.querySelector(
        selectors.moreTabsButton
      );
      expect(moreTabsButton.textContent.trim()).toContain('More');
    });

    it('should show the More label even when the active tab has a long label, as long as there is room for it', async () => {
      mockContainerWidth = 500;
      const numberOfTabs = 3;
      const tabs = createExampleTabSlots(numberOfTabs);
      // @ts-ignore
      tabs[0].isActive = true;
      // @ts-ignore
      tabs[0].mockWidth = 300;
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      const moreTabsButton = element.shadowRoot.querySelector(
        selectors.moreTabsButton
      );
      expect(moreTabsButton.textContent.trim()).toContain('More');

      mockContainerWidth = 200;
    });

    it('should position the More button after selecting a long tab and then another overflowing tab', async () => {
      mockContainerWidth = 300;
      const tabs = createExampleTabSlots(4);
      const widths = [100, 300, 100, 100];
      const initialRights = [100, 400, 500, 600];
      tabs.forEach((tab, index) => {
        // @ts-ignore
        tab.mockWidth = widths[index];
        // @ts-ignore
        tab.mockRight = initialRights[index];
      });
      // @ts-ignore
      tabs[0].isActive = true;
      const element = createTestComponent(defaultOptions, tabs);
      await flushPromises();

      const moreTabsSection = element.shadowRoot.querySelector(
        selectors.moreTabsSection
      );
      const selectTab = (selectedIndex) => {
        tabs.forEach((tab, index) => {
          // @ts-ignore
          tab.isActive = index === selectedIndex;
        });
        element.dispatchEvent(
          new CustomEvent('quantic__tabrendered', {bubbles: true})
        );
      };

      // Selecting the long tab makes it the first displayed tab after flex ordering.
      selectTab(1);
      await flushPromises();
      expect(moreTabsSection.style.left).toBe('300px');

      // Simulate the positions after the first pass has applied the new flex order.
      // @ts-ignore
      tabs[0].mockRight = 400;
      // @ts-ignore
      tabs[1].mockRight = 300;
      // @ts-ignore
      tabs[2].mockRight = 500;
      // @ts-ignore
      tabs[3].mockRight = 600;

      selectTab(2);
      await flushPromises();

      expect(moreTabsSection.style.left).toBe('200px');
      expect(moreTabsSection.style.display).toBe('block');
      mockContainerWidth = 200;
    });
  });
});
