/* eslint-disable jest/no-conditional-expect */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticTimelineEvent from '../quanticTimelineEvent';

const selectors = {
  title: '[data-id="title"]',
  icon: 'lightning-icon',
  vector: '.timeline-event_vector',
  timestamp: '[data-id="timestamp"]',
  searchHub: '[data-id="searchHub"]',
};

const exampleSearchHub = 'example search hub';
const exampleTitle = 'example title';
const exampleTimestamp = '10:25';

const defaultOptions = {
  title: exampleTitle,
  type: 'custom',
  searchHub: exampleSearchHub,
  timestamp: exampleTimestamp,
  isLastEventInSession: false,
};

const expectations = {
  click: {
    iconName: 'utility:file',
    iconClass: 'timeline-event_blue-icon',
    iconVariant: null,
    textClass: 'timeline-event_blue-text',
  },
  view: {
    iconName: 'utility:preview',
    iconClass: 'timeline-event_blue-icon',
    iconVariant: null,
    textClass: 'timeline-event_blue-text',
  },
  search: {
    iconName: 'utility:search',
    iconClass: 'timeline-event_black-icon',
    iconVariant: null,
    textClass: 'timeline-event_black-text',
  },
  custom: {
    iconName: 'utility:record',
    iconClass: 'timeline-event_black-icon',
    iconVariant: null,
    textClass: 'timeline-event_black-text',
  },
  'case-creation': {
    iconName: 'utility:priority',
    iconClass: 'timeline-event_black-icon',
    iconVariant: null,
    textClass: 'timeline-event_black-text',
  },
  'active-case-creation': {
    iconName: 'utility:priority',
    iconClass: null,
    iconVariant: 'success',
    textClass: 'slds-text-color_success timeline-event_bold-text',
  },
};

const baseExpectedTextClass = 'slds-text-title slds-var-m-left_small';

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-timeline-event', {
    is: QuanticTimelineEvent,
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

describe('c-quantic-timeline-event', () => {
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
    describe(`timeline event of type "${key}"`, () => {
      it('should properly display the QuanticTimelineEvent', async () => {
        const element = createTestComponent({...defaultOptions, type: key});
        await flushPromises();

        const title = element.shadowRoot.querySelector(selectors.title);
        const icon = element.shadowRoot.querySelector(selectors.icon);
        const timestamp = element.shadowRoot.querySelector(selectors.timestamp);
        const searchHub = element.shadowRoot.querySelector(selectors.searchHub);
        const vector = element.shadowRoot.querySelector(selectors.vector);

        expect(title.textContent).toBe(exampleTitle);
        expect(timestamp.textContent).toBe(exampleTimestamp);
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

  it('should not display the vector in the last timeline event', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      isLastEventInSession: true,
    });
    await flushPromises();

    const vector = element.shadowRoot.querySelector(selectors.vector);
    expect(vector).toBeNull();
  });
});
