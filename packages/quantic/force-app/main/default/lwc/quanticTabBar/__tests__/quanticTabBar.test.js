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

const exampleItemOne = document.createElement('c-quantic-tab', {
  is: 'c-quantic-tab',
});
exampleItemOne.innerText = 'Item One';
exampleItemOne.setAttribute('engine-id', '1');
exampleItemOne.setAttribute('label', 'Item One');

const exampleItemTwo = document.createElement('c-quantic-tab', {
  is: 'c-quantic-tab',
});
exampleItemTwo.innerText = 'Item Two';
exampleItemTwo.setAttribute('engine-id', '2');
exampleItemTwo.setAttribute('label', 'Item Two');

const exampleAssignedElements = [exampleItemOne, exampleItemTwo];

const tabBarItemDisplayedStyles = '';

const selectors = {
  tabBarContainer: '.tab-bar_container',
  dropdown: '.slds-dropdown',
};

function createTestComponent(
  options = defaultOptions,
  assignedElements = exampleAssignedElements
) {
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

/**
 * Mocks the return value of the assignedNodes method.
 * @param {Array<Element>} assignedElements
 */
function mockSlotAssignedNodes(assignedElements) {
  HTMLSlotElement.prototype.assignedNodes = function () {
    return assignedElements;
  };
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

  it('should display all the tabs without displaying the dropdown list', async () => {
    const expectedOpenDropdownClass = 'slds-is-open';
    const expectedInnerText = ['Item One', 'Item Two'];

    const element = createTestComponent();
    await flushPromises();

    [exampleItemOne, exampleItemTwo].forEach((tabItem, index) => {
      expect(tabItem.style.display).toEqual(tabBarItemDisplayedStyles);
      expect(tabItem.innerText).toEqual(expectedInnerText[index]);
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
