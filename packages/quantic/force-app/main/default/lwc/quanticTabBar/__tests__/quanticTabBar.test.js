/* eslint-disable no-import-assign */
import QuanticTabBar from '../quanticTabBar';
// @ts-ignore
import {createElement} from 'lwc';

jest.mock('@salesforce/label/c.quantic_More', () => ({default: 'More'}), {
  virtual: true,
});

const defaultOptions = {
  lightTheme: false,
};

const selectors = {
  tabBarContainer: '.tab-bar_container',
  dropdown: '.slds-dropdown',
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
  mockSlotAssignedNodes(assignedElements);

  const element = createElement('c-quantic-tab-bar', {
    is: QuanticTabBar,
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

  const exampleSlots = [
    {
      engineId: 'example engine id',
      label: 'Item One',
      expression: 'example expression',
      isActive: true,
    },
    {
      engineId: 'example engine id',
      label: 'Item Two',
      expression: 'example expression',
      isActive: false,
    },
  ];

  const exampleAssignedElements = exampleSlots;

  it('should display all the tabs without displaying the dropdown list', async () => {
    const expectedOpenDropdownClass = 'slds-is-open';

    const element = createTestComponent(
      defaultOptions,
      exampleAssignedElements
    );
    await flushPromises();

    exampleSlots.forEach((tabItem, index) => {
      expect(tabItem.label).toEqual(exampleSlots[index].label);
      expect(tabItem.engineId).toEqual(exampleSlots[index].engineId);
      expect(tabItem.expression).toEqual(exampleSlots[index].expression);
      expect(tabItem.isActive).toEqual(exampleSlots[index].isActive);
    });

    const dropdown = element.shadowRoot.querySelector(selectors.dropdown);
    expect(dropdown.classList).not.toContain(expectedOpenDropdownClass);
  });

  describe('when the light theme property is set to true', () => {
    it('should display the component with the light theme styles', async () => {
      const expectedDarkThemeClass = 'slds-theme_shade';
      const element = createTestComponent({lightTheme: true});
      await flushPromises();

      const tabBarContainer = element.shadowRoot.querySelector(
        selectors.tabBarContainer
      );
      expect(tabBarContainer.classList).not.toContain(expectedDarkThemeClass);
    });
  });

  describe('when the light theme property is set to false', () => {
    it('should display the component with the light theme styles', async () => {
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
