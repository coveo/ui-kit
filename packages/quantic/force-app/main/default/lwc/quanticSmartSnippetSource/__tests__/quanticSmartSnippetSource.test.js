import {
  getNavigateCalledWith,
  getGenerateUrlCalledWith,
} from 'lightning/navigation';
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
  source: {
    clickUri: exampleUri,
    title: exampleTitle,
  },
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

  it('should not display the source uri when the uri option is undefined', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      source: {
        clickUri: undefined,
        title: exampleTitle,
      },
    });
    await flushPromises();

    const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);

    expect(sourceUri).toBeNull();
  });

  it('should not display the source title when the title option is undefined', async () => {
    const element = createTestComponent({
      ...defaultOptions,
      source: {
        clickUri: exampleUri,
        title: undefined,
      },
    });
    await flushPromises();

    const sourceTitle = element.shadowRoot.querySelector(selectors.sourceTitle);

    expect(sourceTitle).toBeNull();
  });

  ['sourceUri', 'sourceTitle'].forEach((key) => {
    describe(`the analytics bindings of the ${key}`, () => {
      for (const [eventName, action] of Object.entries(bindingsMap)) {
        it(`should execute the proper action when the ${eventName} is triggered`, async () => {
          const element = createTestComponent({
            ...defaultOptions,
            source: {
              clickUri: '#',
              title: exampleTitle,
            },
          });
          await flushPromises();

          const sourceUri = element.shadowRoot.querySelector(selectors[key]);
          sourceUri.dispatchEvent(new CustomEvent(eventName));

          expect(action).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  describe('when the smart snippet source is of type Salesforce', () => {
    const exampleSfid = '123';
    const exampleSalesforceLink = 'https://www.example-salesforce.com/';

    it('should call the navigation mixin to get the Salesforce record URL', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        source: {
          clickUri: exampleUri,
          title: exampleTitle,
          raw: {
            sfid: exampleSfid,
          },
        },
      });
      await flushPromises();

      const sourceTitle = element.shadowRoot.querySelector(
        selectors.sourceTitle
      );
      const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);
      const {pageReference} = getGenerateUrlCalledWith();

      expect(pageReference.attributes.recordId).toBe(exampleSfid);
      expect(sourceTitle.href).toBe(exampleSalesforceLink);
      expect(sourceUri.href).toBe(exampleSalesforceLink);
    });

    it('should open the source link inside Salesforce after clicking the source title', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        source: {
          clickUri: exampleUri,
          title: exampleTitle,
          raw: {
            sfid: exampleSfid,
          },
        },
      });
      await flushPromises();

      const sourceTitle = element.shadowRoot.querySelector(
        selectors.sourceTitle
      );
      sourceTitle.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(exampleSfid);
    });

    it('should open the source link inside Salesforce after clicking the source uri', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        source: {
          clickUri: exampleUri,
          title: exampleTitle,
          raw: {
            sfid: exampleSfid,
          },
        },
      });
      await flushPromises();

      const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);
      sourceUri.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(exampleSfid);
    });

    describe('when the result is a knowledge article', () => {
      it('should open the source link inside Salesforce after clicking the source title', async () => {
        const exampleSfkavid = 'bar';
        const element = createTestComponent({
          ...defaultOptions,
          source: {
            clickUri: exampleUri,
            title: exampleTitle,
            raw: {
              sfid: exampleSfid,
              sfkbid: 'foo',
              sfkavid: exampleSfkavid,
            },
          },
        });
        await flushPromises();

        const sourceTitle = element.shadowRoot.querySelector(
          selectors.sourceTitle
        );
        sourceTitle.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(exampleSfkavid);
        expect(sourceTitle.href).toBe(exampleSalesforceLink);
      });

      it('should open the source link inside Salesforce after clicking the source uri', async () => {
        const exampleSfkavid = 'bar';
        const element = createTestComponent({
          ...defaultOptions,
          source: {
            clickUri: exampleUri,
            title: exampleTitle,
            raw: {
              sfid: exampleSfid,
              sfkbid: 'foo',
              sfkavid: exampleSfkavid,
            },
          },
        });
        await flushPromises();

        const sourceUri = element.shadowRoot.querySelector(selectors.sourceUri);
        sourceUri.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(exampleSfkavid);
        expect(sourceUri.href).toBe(exampleSalesforceLink);
      });
    });
  });
});
