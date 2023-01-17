/* eslint-disable jest/no-conditional-expect */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticUserActionEvent from '../quanticUserActionEvent';

const selectors = {
  title: '[data-id="title"]',
  link: '[data-id="link"]',
  icon: 'lightning-icon',
  vector: '.ua-event_vector',
  timestamp: '[data-id="timestamp"] lightning-formatted-date-time',
  searchHub: '[data-id="searchHub"]',
};

const exampleSearchHub = 'example search hub';
const exampleTitle = 'example title';
const exampleTimestamp = '1672768867000';
const exampleUri = 'http://exampleuri.com/';
const clickableIconClass = 'ua-event_blue-icon';

const defaultOptions = {
  action: {
    actionType: 'custom',
    document: {
      title: exampleTitle,
    },
    searchHub: exampleSearchHub,
    timestamp: exampleTimestamp,
    isLastEventInSession: false,
  },
};

const expectations = {
  click: {
    iconName: 'utility:file',
    iconClass: 'ua-event_black-icon',
    iconVariant: null,
    textClass: 'ua-event_black-text',
  },
  view: {
    iconName: 'utility:preview',
    iconClass: 'ua-event_black-icon',
    iconVariant: null,
    textClass: 'ua-event_black-text',
  },
  search: {
    iconName: 'utility:search',
    iconClass: 'ua-event_black-icon',
    iconVariant: null,
    textClass: 'ua-event_black-text',
  },
  custom: {
    iconName: 'utility:record',
    iconClass: 'ua-event_black-icon',
    iconVariant: null,
    textClass: 'ua-event_black-text',
  },
  'case-creation': {
    iconName: 'utility:priority',
    iconClass: 'ua-event_black-icon',
    iconVariant: null,
    textClass: 'ua-event_black-text',
  },
  'active-case-creation': {
    iconName: 'utility:priority',
    iconClass: null,
    iconVariant: 'success',
    textClass: 'slds-text-color_success ua-event_bold-text',
  },
};

const baseExpectedTextClass = 'slds-text-title slds-var-m-left_small';

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-user-action-event', {
    is: QuanticUserActionEvent,
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

describe('c-quantic-user-action-event', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }

  afterEach(() => {
    cleanup();
  });

  for (const [key, expectation] of Object.entries(expectations)) {
    describe(`user action event of type "${key}"`, () => {
      it('should properly display the QuanticUserActionEvent', async () => {
        const element = createTestComponent({
          action: {...defaultOptions.action, actionType: key},
        });
        await flushPromises();

        const title = element.shadowRoot.querySelector(selectors.title);
        const icon = element.shadowRoot.querySelector(selectors.icon);
        const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
        const searchHub = element.shadowRoot.querySelector(selectors.searchHub);
        const vector = element.shadowRoot.querySelector(selectors.vector);

        expect(title.textContent).toBe(exampleTitle);
        expect(timestamp.value).toBe(exampleTimestamp);
        expect(searchHub.textContent).toBe(exampleSearchHub);
        expect(icon.iconName).toBe(expectation.iconName);
        if (!expectation.iconVariant) {
          expect(icon.variant).toBeNull();
        } else {
          expect(icon.variant).toBe(expectation.iconVariant);
        }
        if (expectation.iconClass) {
          expect(Object.values(icon.classList).join(' ')).toBe(
            expectation.iconClass
          );
        } else {
          expect(Object.values(icon.classList).join(' ')).toBe('');
        }
        expect(Object.values(title.classList).join(' ')).toBe(
          `${baseExpectedTextClass} ${expectation.textClass}`
        );
        expect(vector).not.toBeNull();
      });
    });
  }

  it('should not display the vector in the last user action event', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      isLastEventInSession: true,
    });
    await flushPromises();

    const vector = element.shadowRoot.querySelector(selectors.vector);
    expect(vector).toBeNull();
  });

  describe('when the #clickUri is defined in the user action event', () => {
    ['click', 'view'].forEach((type) => {
      it(`should display a clickable user action event of type ${type}`, async () => {
        const element = createTestComponent({
          action: {
            ...defaultOptions.action,
            actionType: type,
            document: {...defaultOptions.action.document, clickUri: exampleUri},
          },
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.link);
        const icon = element.shadowRoot.querySelector(selectors.icon);
        const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
        const searchHub = element.shadowRoot.querySelector(selectors.searchHub);
        const vector = element.shadowRoot.querySelector(selectors.vector);

        expect(link.textContent).toBe(exampleTitle);
        expect(link.href).toBe(exampleUri);

        expect(timestamp.value).toBe(exampleTimestamp);
        expect(searchHub.textContent).toBe(exampleSearchHub);
        expect(icon.iconName).toBe(expectations[type].iconName);
        expect(icon.variant).toBeNull();

        expect(Object.values(icon.classList).join(' ')).toBe(
          clickableIconClass
        );
        expect(vector).not.toBeNull();
      });
    });
  });
});
