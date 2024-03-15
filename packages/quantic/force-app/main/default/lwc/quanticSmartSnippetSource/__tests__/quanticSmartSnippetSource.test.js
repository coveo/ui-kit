// @ts-ignore
import {createElement} from 'lwc';
import QuanticSmartSnippetSource from '../quanticSmartSnippetSource';

const functionsMocks = {
  exampleSelect: jest.fn(() => {}),
  exampleBeginDelayedSelect: jest.fn(() => {}),
  exampleCancelPendingSelect: jest.fn(() => {}),
};

const selectors = {
  sourceUri: '.smart-snippet__source-uri',
  sourceTitle: '.smart-snippet__source-title',
};

const exampleUri = 'https://www.example.com/';
const exampleTitle = 'example label';
const exampleActions = {
  select: functionsMocks.exampleSelect,
  beginDelayedSelect: functionsMocks.exampleBeginDelayedSelect,
  cancelPendingSelect: functionsMocks.exampleCancelPendingSelect,
};

const defaultOptions = {
  uri: exampleUri,
  title: exampleTitle,
  actions: exampleActions,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-smart-snippet-source', {
    is: QuanticSmartSnippetSource,
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

const bindingsMap = {
  contextmenu: functionsMocks.exampleSelect,
  click: functionsMocks.exampleSelect,
  mouseup: functionsMocks.exampleSelect,
  mousedown: functionsMocks.exampleSelect,
  touchstart: functionsMocks.exampleBeginDelayedSelect,
  touchend: functionsMocks.exampleCancelPendingSelect,
};

describe('c-quantic-smart-snippet-source', () => {
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

  it('should properly display the source uri', async () => {
    const element = createTestComponent();
    await flushPromises();

    const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);

    expect(sourceUri).not.toBeNull();
    expect(sourceUri.textContent).toBe(exampleUri);
    expect(sourceUri.href).toBe(exampleUri);
  });

  it('should target a new tab when clicked', async () => {
    const element = createTestComponent();
    await flushPromises();

    const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);
    const sourceTitle = element.shadowRoot.querySelector(selectors.sourceTitle);

    expect(sourceUri).not.toBeNull();
    expect(sourceUri.target).toBe('_blank');

    expect(sourceTitle).not.toBeNull();
    expect(sourceTitle.target).toBe('_blank');
  });

  it('should properly display the source title', async () => {
    const element = createTestComponent();
    await flushPromises();

    const sourceTitle = element.shadowRoot.querySelector(selectors.sourceTitle);

    expect(sourceTitle).not.toBeNull();
    expect(sourceTitle.textContent).toBe(exampleTitle);
    expect(sourceTitle.href).toBe(exampleUri);
  });

  ['sourceUri', 'sourceTitle'].forEach((key) => {
    describe(`the analytics bindings of the ${key}`, () => {
      for (const [eventName, action] of Object.entries(bindingsMap)) {
        it(`should execute the proper action when the ${eventName} is triggered`, async () => {
          const element = createTestComponent({...defaultOptions, uri: '#'});
          await flushPromises();

          const sourceUri = element.shadowRoot.querySelector(selectors[key]);
          sourceUri.dispatchEvent(new CustomEvent(eventName));

          expect(action).toHaveBeenCalledTimes(1);
        });
      }
    });
  });
});
