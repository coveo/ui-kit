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

const exampleItemOne = document.createElement('c-quantic-tab');
exampleItemOne.innerText = 'Item One';
const exampleItemTwo = document.createElement('c-quantic-tab');
exampleItemTwo.innerText = 'Item Two';
const exampleAssignedElements = [exampleItemOne, exampleItemTwo];

const selectors = {
  tabBarContainer: '.tab-bar_container',
  tab: 'c-quantic-tab',
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
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
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

describe('c-quantic-tab-bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display all the tabs without displaying the dropdown list', async () => {
    const element = createTestComponent();
    await flushPromises();

    const tabs = element.shadowRoot.querySelectorAll(selectors.tab);
    console.log(JSON.stringify(tabs.items(0)));
    expect(tabs.length).toBeGreaterThan(0);

    // const dropdown = element.shadowRoot.querySelector(selectors.dropdown);
    // expect(dropdown).toBeNull();
  });

  describe('when the light theme property is set to true', () => {
    it('should display the component with the light theme styles', async () => {
      const expectedDarkThemeClass = 'slds-theme_shade';
      const element = createTestComponent({lightTheme: true});
      await flushPromises();

      // const tabs = element.shadowRoot.querySelectorAll(selectors.tabs);
      // expect(tabs.length).toBeGreaterThan(0);

      const tabBarContainer = element.shadowRoot.querySelector(
        selectors.tabBarContainer
      );
      expect(tabBarContainer.classList).not.toContain(expectedDarkThemeClass);
    });
  });
});
