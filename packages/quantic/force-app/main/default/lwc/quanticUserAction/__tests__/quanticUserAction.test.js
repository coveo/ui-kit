// @ts-ignore
import quanticUserAction from 'c/quanticUserAction';
// @ts-ignore
import {createElement} from 'lwc';

jest.mock(
  '@salesforce/label/c.quantic_TicketCreated',
  () => ({default: 'Ticket created'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_EmptySearch',
  () => ({default: 'Empty search'}),
  {
    virtual: true,
  }
);

const expectedSearchHub = 'example search hub';
const expectedEventDataValue = 'example event data value';
const expectedEventDataType = 'example event data type';
const expectedTitle = 'example title';
const expectedQuery = 'example query';
const expectedUrl = 'https://www.coveo.com/';

const expectations = {
  ticketCreation: {
    iconName: 'utility:priority',
    iconClass: 'user-action__ticket-creation-icon',
    titleClass: 'user-action__ticket-creation-title',
  },
  customAction: {
    iconName: 'utility:record',
    iconClass: 'user-action__custom-action-icon',
    titleClass: 'user-action__title',
  },
  clickAction: {
    iconName: 'utility:file',
    iconClass: 'user-action__click-action-icon',
    titleClass: 'user-action__title',
  },
  searchAction: {
    iconName: 'utility:search',
    iconClass: 'user-action__search-action-icon',
    titleClass: 'user-action__title',
  },
  viewAction: {
    iconName: 'utility:preview',
    iconClass: 'user-action__view-action-icon',
    titleClass: 'user-action__title',
  },
};

const selectors = {
  icon: 'lightning-icon',
  title: '[data-test="action__title"]',
  searchHub: '[data-test="action__search-hub"]',
  timestamp: '[data-test="action__timestamp"]',
  link: 'a',
};

function createTestComponent(options) {
  const element = createElement('c-quantic-user-action', {
    is: quanticUserAction,
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

describe('c-quantic-user-action', () => {
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

  let exampleDate = new Date('2024-09-25T04:06');
  let exampleDateInUTC = new Date(exampleDate.toUTCString());
  describe('ticket creation action', () => {
    const exampleAction = {
      actionType: 'TICKET_CREATION',
      searchHub: expectedSearchHub,
      timestamp: exampleDateInUTC,
    };

    it('should properly display the action icon', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const icon = element.shadowRoot.querySelector(selectors.icon);

      const {iconName, iconClass} = expectations.ticketCreation;

      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(iconName);
      expect(icon.classList.contains(iconClass)).toBe(true);
    });

    it('should properly display the action title', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);

      const {titleClass} = expectations.ticketCreation;

      expect(title).not.toBeNull();
      expect(title.textContent).toBe('Ticket created');
      expect(title.classList.contains(titleClass)).toBe(true);
    });

    it('should properly display the action details', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
      const searchHub = element.shadowRoot.querySelector(selectors.searchHub);

      expect(timestamp).not.toBeNull();
      expect(searchHub).not.toBeNull();

      expect(searchHub.textContent).toBe(expectedSearchHub);
      expect(timestamp.textContent).toBe('04:06');
    });
  });

  describe('custom action', () => {
    exampleDate = new Date('2024-09-25T04:07');
    exampleDateInUTC = new Date(exampleDate.toUTCString());
    const exampleAction = {
      actionType: 'CUSTOM',
      searchHub: expectedSearchHub,
      timestamp: exampleDateInUTC,
      eventData: {
        value: expectedEventDataValue,
      },
    };

    it('should properly display the action icon', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const icon = element.shadowRoot.querySelector(selectors.icon);

      const {iconName, iconClass} = expectations.customAction;

      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(iconName);
      expect(icon.classList.contains(iconClass)).toBe(true);
    });

    it('should properly display the action title', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);

      const {titleClass} = expectations.customAction;

      expect(title).not.toBeNull();
      expect(title.textContent).toBe(expectedEventDataValue);
      expect(title.classList.contains(titleClass)).toBe(true);
    });

    it('should properly display the action details', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
      const searchHub = element.shadowRoot.querySelector(selectors.searchHub);

      expect(timestamp).not.toBeNull();
      expect(searchHub).not.toBeNull();

      expect(searchHub.textContent).toBe(expectedSearchHub);
      expect(timestamp.textContent).toBe('04:07');
    });

    describe('when the action.eventData.value is empty', () => {
      it('should display action.eventData.type as the action title', async () => {
        const element = createTestComponent({
          action: {
            ...exampleAction,
            eventData: {
              value: '',
              type: expectedEventDataType,
            },
          },
        });
        await flushPromises();

        const title = element.shadowRoot.querySelector(selectors.title);

        const {titleClass} = expectations.searchAction;

        expect(title).not.toBeNull();
        expect(title.textContent).toBe(expectedEventDataType);
        expect(title.classList.contains(titleClass)).toBe(true);
      });
    });
  });

  describe('click action', () => {
    exampleDate = new Date('2024-09-25T05:07');
    exampleDateInUTC = new Date(exampleDate.toUTCString());
    const exampleAction = {
      actionType: 'CLICK',
      searchHub: expectedSearchHub,
      timestamp: exampleDateInUTC,
      document: {
        title: expectedTitle,
      },
    };

    it('should properly display the action icon', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const icon = element.shadowRoot.querySelector(selectors.icon);

      const {iconName, iconClass} = expectations.clickAction;

      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(iconName);
      expect(icon.classList.contains(iconClass)).toBe(true);
    });

    it('should properly display the action title', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);

      const {titleClass} = expectations.clickAction;

      expect(title).not.toBeNull();
      expect(title.textContent).toBe(expectedTitle);
      expect(title.classList.contains(titleClass)).toBe(true);
    });

    it('should properly display the action details', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
      const searchHub = element.shadowRoot.querySelector(selectors.searchHub);

      expect(timestamp).not.toBeNull();
      expect(searchHub).not.toBeNull();

      expect(searchHub.textContent).toBe(expectedSearchHub);
      expect(timestamp.textContent).toBe('05:07');
    });
  });

  describe('search action', () => {
    exampleDate = new Date('2024-09-25T06:08');
    exampleDateInUTC = new Date(exampleDate.toUTCString());
    const exampleAction = {
      actionType: 'SEARCH',
      searchHub: expectedSearchHub,
      timestamp: exampleDateInUTC,
      query: expectedQuery,
    };

    it('should properly display the action icon', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const icon = element.shadowRoot.querySelector(selectors.icon);

      const {iconName, iconClass} = expectations.searchAction;

      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(iconName);
      expect(icon.classList.contains(iconClass)).toBe(true);
    });

    it('should properly display the action title', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.title);

      const {titleClass} = expectations.searchAction;

      expect(title).not.toBeNull();
      expect(title.textContent).toBe(expectedQuery);
      expect(title.classList.contains(titleClass)).toBe(true);
    });

    it('should properly display the action details', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
      const searchHub = element.shadowRoot.querySelector(selectors.searchHub);

      expect(timestamp).not.toBeNull();
      expect(searchHub).not.toBeNull();

      expect(searchHub.textContent).toBe(expectedSearchHub);
      expect(timestamp.textContent).toBe('06:08');
    });

    describe('when the query is empty', () => {
      it('should display "Empty search" as the action title', async () => {
        const element = createTestComponent({
          action: {...exampleAction, query: ''},
        });
        await flushPromises();

        const title = element.shadowRoot.querySelector(selectors.title);

        const {titleClass} = expectations.searchAction;

        expect(title).not.toBeNull();
        expect(title.textContent).toBe('Empty search');
        expect(title.classList.contains(titleClass)).toBe(true);
      });
    });
  });

  describe('view action', () => {
    exampleDate = new Date('2024-09-25T04:07');
    exampleDateInUTC = new Date(exampleDate.toUTCString());
    const exampleAction = {
      actionType: 'VIEW',
      document: {
        title: expectedTitle,
        contentIdValue: expectedUrl,
      },
      searchHub: expectedSearchHub,
      timestamp: exampleDateInUTC,
    };

    it('should properly display the action icon', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const icon = element.shadowRoot.querySelector(selectors.icon);

      const {iconName, iconClass} = expectations.viewAction;

      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(iconName);
      expect(icon.classList.contains(iconClass)).toBe(true);
    });

    describe('when the contentIdKey of the action is clickable', () => {
      it('should display the action title as a link', async () => {
        const element = createTestComponent({
          action: {
            ...exampleAction,
            document: {
              ...exampleAction.document,
              contentIdKey: '@clickableuri',
            },
          },
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.link);

        expect(link).not.toBeNull();
        expect(link.textContent).toBe(expectedTitle);
        expect(link.href).toBe(expectedUrl);
      });
    });

    describe('when the contentIdKey of the action is not clickable', () => {
      it('should display the action title as a text', async () => {
        const element = createTestComponent({
          action: {
            ...exampleAction,
            document: {
              ...exampleAction.document,
              contentIdKey: '@sfid',
            },
          },
        });
        await flushPromises();

        const title = element.shadowRoot.querySelector(selectors.title);
        const link = element.shadowRoot.querySelector(selectors.link);
        const {titleClass} = expectations.viewAction;

        expect(link).toBeNull();
        expect(title).not.toBeNull();
        expect(title.textContent).toBe(expectedTitle);
        expect(title.classList.contains(titleClass)).toBe(true);
      });
    });

    it('should properly display the action details', async () => {
      const element = createTestComponent({action: exampleAction});
      await flushPromises();

      const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
      const searchHub = element.shadowRoot.querySelector(selectors.searchHub);

      expect(timestamp).not.toBeNull();
      expect(searchHub).not.toBeNull();

      expect(searchHub.textContent).toBe(expectedSearchHub);
      expect(timestamp.textContent).toBe('04:07');
    });
  });
});
